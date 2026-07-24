from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db, Paper, ChatMessage
from services.auth_service import get_current_user
from rag.rag_cache import RAGCache
from services.QnA_service import QnAService

router = APIRouter()

class QnARequest(BaseModel):
    paper_url: str
    query: str

@router.post("/qna")
def generate_answer(
    request: QnARequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Find paper in database to get ID
        paper = db.query(Paper).filter(Paper.paper_url == request.paper_url).first()
        if not paper:
            raise HTTPException(status_code=404, detail="Paper not found in database")

        # Save user message
        user_msg = ChatMessage(
            user_id=current_user.id,
            paper_id=paper.id,
            role="user",
            content=request.query,
            created_at=datetime.utcnow().isoformat()
        )
        db.add(user_msg)
        db.commit()

        # Load RAG bundle and answer
        bundle = RAGCache.get(request.paper_url)
        if bundle is None:
            # If not in cache, try to rebuild it
            from rag.rag_service import RAGService
            bundle = RAGService.build(request.paper_url)
            if bundle is None:
                raise Exception("Paper not analyzed yet")
        
        rag = bundle.rag
        qna_service = QnAService(rag)
        result = qna_service.answer(request.query)

        # Save assistant message
        assistant_msg = ChatMessage(
            user_id=current_user.id,
            paper_id=paper.id,
            role="assistant",
            content=result,
            created_at=datetime.utcnow().isoformat()
        )
        db.add(assistant_msg)
        db.commit()

        return {
            "status": "success",
            "answer": result
        }
    except Exception as e:
        print("ERROR TYPE:", type(e).__name__)
        print("ERROR MESSAGE:", str(e))
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )