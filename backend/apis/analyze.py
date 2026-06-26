from fastapi import APIRouter, HTTPException , Request
from pydantic import BaseModel
from starlette.concurrency import run_in_threadpool

from rag.rag_service import RAGService
from DocStore.paper_understaning import PaperUnderstandingService
from llm.llm import get_llm
from ai.vector_store import save_paper_understanding
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
    http_request : Request
    ):
    create_task(request.task_id)
    try:
        print("REQUEST RECEIVED")
        print(f"Analyzing paper: {request.paper_url}")
        
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
            print("Returning cached paper understanding")
            return {
                "status": "success",
                "message":"Paper analysis loaded from cache",
                "analysis":bundle.paper_understanding,
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

        print("Paper understanding generated successfully")

        result = {
            "status": "success",
            "message":"Paper analyzed successfully",
            "analysis":bundle.paper_understanding,
        }
        print("RETURNING RESPONSE")
        return result

    except CancellationError:
        return cancellation_detected(request.task_id)

    except Exception as e:

        error = str(e).lower()

        print(
            f"Paper analysis failed: {str(e)}"
        )
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
