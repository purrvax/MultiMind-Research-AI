from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from rag.rag_cache import RAGCache
from services.QnA_service import QnAService

router = APIRouter()
class QnARequest(BaseModel):
    paper_url: str
    query: str

@router.post("/qna")
def generate_answer(request:QnARequest):

    try:
        bundle = RAGCache.get(
            request.paper_url
        )
        if bundle is None:
            raise Exception("Paper not analyzed yet")
        
        rag = bundle.rag
        qna_service = QnAService(rag)

        result = qna_service.answer(request.query)
        return {
            "status" : "success",
            "answer" : result
        }
    except Exception as e:
        print("ERROR TYPE:", type(e).__name__)
        print("ERROR MESSAGE:", str(e))

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )