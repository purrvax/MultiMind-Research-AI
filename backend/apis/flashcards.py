from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from rag.rag_cache import RAGCache
from services.flashcard_service import FlashcardService

router = APIRouter()

class FlashCardRequest(BaseModel):
    paper_url: str
    topic: str
    difficulty: str = "medium"
    count: int = 10


@router.post("/flashcards")
def generate_flashcards(request: FlashCardRequest):
    try:
        bundle = RAGCache.get(request.paper_url)
        if bundle is None:
            raise HTTPException(
                status_code=404,
                detail="RAG context not found for given paper_url"
            )
        # 2. Initialize flashcard service
        service = FlashcardService(bundle.rag)
        # 3. Generate flashcards
        flashcards = service.generate_flashcards(
            topic = request.topic,
            difficulty=request.difficulty,
            count=request.count
        )
        return {
            "success": "success",
            "count": len(flashcards),
            "flashcards": flashcards
        }
    except Exception as e:
        print("ERROR TYPE:", type(e).__name__)
        print("ERROR MESSAGE:", str(e))

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )