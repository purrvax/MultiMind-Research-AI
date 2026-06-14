from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from rag.rag_cache import RAGCache
from services.summary_service import SummaryService
from llm.llm import get_llm
router = APIRouter()
class SummaryRequest(BaseModel):
    paper_url: str
    style: str = "technical"
    length: str = "medium"

@router.post("/summary")
def generate_summary(request: SummaryRequest):

    try:
        bundle = RAGCache.get(
            request.paper_url
        )
        if bundle is None:
            raise Exception("Paper not analyzed yet")
        if bundle.paper_understanding is None:
            raise Exception("Paper understanding not generated. Run analyze-paper first.")
        
        paper_understanding = (bundle.paper_understanding)
        llm = get_llm()
        summary_service = SummaryService(llm)

        summary = summary_service.generate(
            paper_understanding=paper_understanding,
            style=request.style,
            length=request.length
        )
        return {
            "status": "success",
            "summary": summary
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )