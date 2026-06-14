from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from rag.rag_cache import RAGCache
from services.notes_service import NotesService

router = APIRouter()

class NotesRequest(BaseModel):
    paper_url: str

@router.post("/notes")
def generate_notes(request : NotesRequest):

    try:
        bundle = RAGCache.get(
            request.paper_url
        )
        if bundle is None:
            raise Exception("Paper not analyzed yet. Run analyze-paper first.")
        if bundle.paper_understanding is None:
            raise Exception("Paper understanding is missing.")
        
        paper_understanding = bundle.paper_understanding
        notes_service = NotesService()
        result = notes_service.generate(
            paper_understanding=paper_understanding
        )
        return {
            "status": "success",
            "notes": result["notes"],
            "highlights" : result["highlights"]
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )