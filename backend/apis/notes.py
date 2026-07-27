import json
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db, Paper, GeneratedAsset
from services.auth_service import get_current_user
from rag.rag_cache import RAGCache
from services.notes_service import NotesService
from llm.llm import get_llm

router = APIRouter()

class NotesRequest(BaseModel):
    paper_url: str

def is_empty_val(val):
    if val is None:
        return True
    if isinstance(val, str):
        return len(val.strip()) == 0
    if isinstance(val, list):
        return len(val) == 0 or all(is_empty_val(item) for item in val)
    if isinstance(val, dict):
        return len(val) == 0 or all(is_empty_val(v) for v in val.values())
    return False

@router.post("/notes")
def generate_notes(
    request: NotesRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Find paper in database to get ID
        paper = db.query(Paper).filter(Paper.paper_url == request.paper_url).first()
        if not paper:
            raise HTTPException(status_code=404, detail="Paper not found in database")

        # Check for cached asset in MySQL
        existing_asset = db.query(GeneratedAsset).filter(
            GeneratedAsset.user_id == current_user.id,
            GeneratedAsset.paper_id == paper.id,
            GeneratedAsset.asset_type == "notes",
            GeneratedAsset.params_json == "{}"
        ).first()

        if existing_asset:
            print("cache hit")
            data = json.loads(existing_asset.content_json)
            return {
                "status": "success",
                "notes": data.get("notes"),
                "highlights": data.get("highlights")
            }

        print("cache miss")
        print("generation started")

        # If not cached in MySQL, load RAG bundle and generate
        bundle = RAGCache.get(request.paper_url)
        if bundle is None:
            from rag.rag_service import RAGService
            bundle = RAGService.build(request.paper_url)
            if bundle is None:
                raise Exception("Paper not analyzed yet. Run analyze-paper first.")
        
        if bundle.paper_understanding is None:
            raise Exception("Paper understanding is missing.")
        
        llm = get_llm()
        paper_understanding = bundle.paper_understanding
        notes_service = NotesService(llm)
        result = notes_service.generate(
            paper_understanding=paper_understanding
        )
        print("generation completed")

        notes_data = result.get("notes", {})

        # Validation checks
        problem_empty = is_empty_val(notes_data.get("problem")) and is_empty_val(notes_data.get("problem_statement"))
        methodology_empty = is_empty_val(notes_data.get("methodology")) and is_empty_val(notes_data.get("methodology_breakdown"))
        core_concepts_empty = is_empty_val(notes_data.get("core_concepts"))
        key_findings_empty = is_empty_val(notes_data.get("key_findings"))
        limitations_empty = is_empty_val(notes_data.get("limitations"))
        conclusion_empty = is_empty_val(notes_data.get("conclusion"))

        if (problem_empty and methodology_empty and core_concepts_empty and 
            key_findings_empty and limitations_empty and conclusion_empty):
            print("invalid notes rejected")
            raise HTTPException(
                status_code=422,
                detail="Generated notes are empty and invalid."
            )

        # Save to database
        current_time = datetime.utcnow().isoformat()
        new_asset = GeneratedAsset(
            user_id=current_user.id,
            paper_id=paper.id,
            asset_type="notes",
            params_json="{}",
            content_json=json.dumps({
                "notes": result["notes"],
                "highlights": result["highlights"]
            }),
            created_at=current_time,
            updated_at=current_time
        )
        
        try:
            db.add(new_asset)
            db.commit()
            print("notes stored")
        except Exception as e:
            db.rollback()
            if "Duplicate entry" in str(e) or "IntegrityError" in type(e).__name__:
                print("database insert skipped")
                # retrieve the cached record
                existing_asset = db.query(GeneratedAsset).filter(
                    GeneratedAsset.user_id == current_user.id,
                    GeneratedAsset.paper_id == paper.id,
                    GeneratedAsset.asset_type == "notes",
                    GeneratedAsset.params_json == "{}"
                ).first()
                if existing_asset:
                    data = json.loads(existing_asset.content_json)
                    return {
                        "status": "success",
                        "notes": data.get("notes"),
                        "highlights": data.get("highlights")
                    }
            raise e

        return {
            "status": "success",
            "notes": result["notes"],
            "highlights": result["highlights"]
        }
    
    except HTTPException as he:
        raise he
    except Exception as e:
        print("ERROR TYPE:", type(e).__name__)
        print("ERROR MESSAGE:", str(e))
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )