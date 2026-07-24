import json
import hashlib
from datetime import datetime
from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from starlette.concurrency import run_in_threadpool

from database import get_db, Paper, UserPaper
from services.auth_service import get_current_user
from rag.rag_service import RAGService
from DocStore.paper_understaning import PaperUnderstandingService
from llm.llm import get_llm
from ai.vector_store import save_paper_understanding, get_paper_persist_directory, load_paper_understanding
from cancel_manager import (
    CancellationError,
    cancel_task,
    create_task,
    is_cancelled,
    remove_task
)

router = APIRouter()

class PaperRequest(BaseModel):
    paper_url: str
    task_id: str
    title: str = None
    authors: list = None
    abstract: str = None
    published_date: str = None
    source: str = None

def cancelled_response():
    return {
        "status": "cancelled",
        "message": "Workspace generation cancelled"
    }

def cancellation_detected(task_id):
    print(f"cancellation detected: {task_id}")
    return cancelled_response()

async def client_disconnected(http_request, stage):
    disconnected = await http_request.is_disconnected()
    if disconnected:
        print(f"Client disconnected {stage}")
    return disconnected

@router.post("/analyze-paper")
async def analyze_paper(
    request: PaperRequest,
    http_request: Request,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    create_task(request.task_id)
    try:
        print("REQUEST RECEIVED")
        print(f"Analyzing paper: {request.paper_url} for user {current_user.email}")
        
        # 1. Generate paper hash
        paper_hash = hashlib.md5(request.paper_url.encode("utf-8")).hexdigest()
        
        # 2. Check if paper exists in database
        paper = db.query(Paper).filter(Paper.paper_hash == paper_hash).first()
        current_time = datetime.utcnow().isoformat()
        
        if not paper:
            # Create paper entry
            authors_str = json.dumps(request.authors) if isinstance(request.authors, list) else str(request.authors) if request.authors else "[]"
            paper = Paper(
                paper_url=request.paper_url,
                paper_hash=paper_hash,
                title=request.title,
                authors=authors_str,
                abstract=request.abstract,
                published_date=request.published_date,
                source=request.source,
                processing_status="pending",
                created_at=current_time,
                updated_at=current_time
            )
            db.add(paper)
            db.commit()
            db.refresh(paper)
        else:
            # Update metadata if provided and currently missing
            updated = False
            if request.title and not paper.title:
                paper.title = request.title
                updated = True
            if request.authors and not paper.authors:
                paper.authors = json.dumps(request.authors) if isinstance(request.authors, list) else str(request.authors)
                updated = True
            if request.abstract and not paper.abstract:
                paper.abstract = request.abstract
                updated = True
            if request.published_date and not paper.published_date:
                paper.published_date = request.published_date
                updated = True
            if request.source and not paper.source:
                paper.source = request.source
                updated = True
            if updated:
                paper.updated_at = current_time
                db.commit()
                db.refresh(paper)

        # 3. Associate paper with user
        user_paper = db.query(UserPaper).filter(
            UserPaper.user_id == current_user.id,
            UserPaper.paper_id == paper.id
        ).first()
        
        if not user_paper:
            user_paper = UserPaper(
                user_id=current_user.id,
                paper_id=paper.id,
                last_opened_at=current_time,
                created_at=current_time,
                updated_at=current_time
            )
            db.add(user_paper)
        else:
            user_paper.last_opened_at = current_time
            user_paper.updated_at = current_time
        db.commit()

        # 4. If paper is already ready and cached files exist, return immediately
        if paper.processing_status == "ready":
            cached_understanding = load_paper_understanding(request.paper_url)
            if cached_understanding:
                print("Returning cached paper understanding from database/disk")
                return {
                    "status": "success",
                    "message": "Paper analysis loaded from cache",
                    "analysis": cached_understanding,
                    "paper_id": paper.id
                }

        # 5. Otherwise build RAG and run analysis
        if await client_disconnected(http_request, "before RAG build"):
            return cancellation_detected(request.task_id)
        
        bundle = await run_in_threadpool(
            RAGService.build,
            request.paper_url
        )

        if is_cancelled(request.task_id):
            print("Task cancelled after RAG build")
            return cancellation_detected(request.task_id)

        await client_disconnected(http_request, "after RAG build")
        
        if bundle.paper_understanding is not None:
            print("Returning cached paper understanding from bundle")
            # Update status in db just in case
            if paper.processing_status != "ready":
                paper.processing_status = "ready"
                paper.vector_store_path = get_paper_persist_directory(request.paper_url)
                paper.paper_understanding_path = f"{paper.vector_store_path}/paper_understanding.json"
                paper.updated_at = datetime.utcnow().isoformat()
                db.commit()
            return {
                "status": "success",
                "message": "Paper analysis loaded from cache",
                "analysis": bundle.paper_understanding,
                "paper_id": paper.id
            }
        
        print("Generating paper understanding...")

        llm = get_llm()
        service = PaperUnderstandingService(llm)
        
        if is_cancelled(request.task_id):
            print("Task cancelled before LLM generation")
            return cancellation_detected(request.task_id)

        await client_disconnected(http_request, "before LLM generation")

        bundle.paper_understanding = await run_in_threadpool(
            service.generate,
            bundle.document_store,
            request.task_id
        )

        if is_cancelled(request.task_id):
            print("Task cancelled after LLM generation")
            return cancellation_detected(request.task_id)

        await client_disconnected(http_request, "after LLM generation")

        if is_cancelled(request.task_id):
            print("Client cancelled before saving result")
            return cancellation_detected(request.task_id)

        await run_in_threadpool(
            save_paper_understanding,
            request.paper_url,
            bundle.paper_understanding
        )

        # Update paper status and path details
        paper.processing_status = "ready"
        paper.vector_store_path = get_paper_persist_directory(request.paper_url)
        paper.paper_understanding_path = f"{paper.vector_store_path}/paper_understanding.json"
        paper.updated_at = datetime.utcnow().isoformat()
        db.commit()

        print("Paper understanding generated successfully")

        result = {
            "status": "success",
            "message": "Paper analyzed successfully",
            "analysis": bundle.paper_understanding,
            "paper_id": paper.id
        }
        print("RETURNING RESPONSE")
        return result

    except CancellationError:
        return cancellation_detected(request.task_id)

    except Exception as e:
        error = str(e).lower()
        print(f"Paper analysis failed: {str(e)}")
        if (
            "rate limit" in error
            or "quota" in error
            or "tokens" in error
            or "429" in error
        ):
            raise HTTPException(
                status_code=429,
                detail="AI API limit exhausted. Please try again later."
            )
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
    finally:
        remove_task(request.task_id)

@router.post("/cancel-analysis/{task_id}")
async def cancel_analysis(task_id: str):
    cancel_task(task_id)
    return {
        "status": "cancelled"
    }
