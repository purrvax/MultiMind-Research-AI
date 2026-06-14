from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from rag.rag_service import RAGService
from DocStore.paper_understaning import PaperUnderstandingService
from llm.llm import get_llm
from rag.rag_cache import RAGCache

router = APIRouter()

class PaperRequest(BaseModel):
    paper_url: str


@router.post("/analyze-paper")
def analyze_paper(request: PaperRequest):

    try:
        # Build RAG context
        bundle = RAGService.build(request.paper_url)
        llm = get_llm()
        # Process chunks
        service = PaperUnderstandingService(llm)
        paper_understanding = service.generate(bundle.document_store)
        
        bundle.paper_understanding = paper_understanding
        RAGCache.set(request.paper_url,bundle)
        return {
            "status":"success",
            "message": "Paper Analyzed",
            "analysis": paper_understanding
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )