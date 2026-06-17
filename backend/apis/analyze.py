from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from rag.rag_service import RAGService
from DocStore.paper_understaning import PaperUnderstandingService
from llm.llm import get_llm
from ai.vector_store import save_paper_understanding

router = APIRouter()

class PaperRequest(BaseModel):
    paper_url: str

@router.post("/analyze-paper")
def analyze_paper(request: PaperRequest):
    try:
        print("REQUEST RECEIVED")
        print(f"Analyzing paper: {request.paper_url}")
        bundle = RAGService.build(request.paper_url)
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
        bundle.paper_understanding = (
            service.generate(bundle.document_store)
        )
        save_paper_understanding(
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
