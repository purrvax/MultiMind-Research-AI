import json
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db, Paper, GeneratedAsset
from services.auth_service import get_current_user
from rag.rag_cache import RAGCache
from services.flashcard_service import FlashcardService

router = APIRouter()

class FlashCardRequest(BaseModel):
    paper_url: str
    topic: str
    difficulty: str = "medium"
    count: int = 10

@router.post("/flashcards")
def generate_flashcards(
    request: FlashCardRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Find paper in database to get ID
        paper = db.query(Paper).filter(Paper.paper_url == request.paper_url).first()
        if not paper:
            raise HTTPException(status_code=404, detail="Paper not found in database")

        # Check for cached asset in MySQL
        existing_assets = db.query(GeneratedAsset).filter(
            GeneratedAsset.user_id == current_user.id,
            GeneratedAsset.paper_id == paper.id,
            GeneratedAsset.asset_type == "flashcards"
        ).all()

        for asset in existing_assets:
            try:
                params = json.loads(asset.params_json)
                if (params.get("topic") == request.topic and 
                    params.get("difficulty") == request.difficulty and 
                    params.get("count") == request.count):
                    print("Returning cached flashcards from database")
                    flashcards = json.loads(asset.content_json)
                    return {
                        "success": "success",
                        "count": len(flashcards),
                        "flashcards": flashcards
                    }
            except Exception:
                continue

        # If not cached in MySQL, load RAG bundle and generate
        bundle = RAGCache.get(request.paper_url)
        if bundle is None:
            from rag.rag_service import RAGService
            bundle = RAGService.build(request.paper_url)
            if bundle is None:
                raise HTTPException(
                    status_code=404,
                    detail="RAG context not found for given paper_url"
                )
        
        service = FlashcardService(bundle.rag)
        flashcards = service.generate_flashcards(
            topic=request.topic,
            difficulty=request.difficulty,
            count=request.count
        )

        # Save to database
        current_time = datetime.utcnow().isoformat()
        new_asset = GeneratedAsset(
            user_id=current_user.id,
            paper_id=paper.id,
            asset_type="flashcards",
            params_json=json.dumps({
                "topic": request.topic,
                "difficulty": request.difficulty,
                "count": request.count
            }),
            content_json=json.dumps(flashcards),
            created_at=current_time,
            updated_at=current_time
        )
        db.add(new_asset)
        db.commit()

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