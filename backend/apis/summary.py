import json
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db, Paper, GeneratedAsset
from services.auth_service import get_current_user
from rag.rag_cache import RAGCache
from services.summary_service import SummaryService
from llm.llm import get_llm

router = APIRouter()

class SummaryRequest(BaseModel):
    paper_url: str
    style: str = "technical"
    length: str = "medium"

@router.post("/summary")
def generate_summary(
    request: SummaryRequest,
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
            GeneratedAsset.asset_type == "summary"
        ).all()

        for asset in existing_assets:
            try:
                params = json.loads(asset.params_json)
                if params.get("style") == request.style and params.get("length") == request.length:
                    print("Returning cached summary from database")
                    return {
                        "status": "success",
                        "summary": json.loads(asset.content_json)
                    }
            except Exception:
                continue

        # If not cached in MySQL, load RAG bundle and generate
        bundle = RAGCache.get(request.paper_url)
        if bundle is None:
            from rag.rag_service import RAGService
            bundle = RAGService.build(request.paper_url)
            if bundle is None:
                raise Exception("Paper not analyzed yet")
        
        if bundle.paper_understanding is None:
            raise Exception("Paper understanding not generated. Run analyze-paper first.")
        
        paper_understanding = bundle.paper_understanding
        llm = get_llm()
        summary_service = SummaryService(llm)

        summary = summary_service.generate(
            paper_understanding=paper_understanding,
            style=request.style,
            length=request.length
        )

        # Save to database
        current_time = datetime.utcnow().isoformat()
        new_asset = GeneratedAsset(
            user_id=current_user.id,
            paper_id=paper.id,
            asset_type="summary",
            params_json=json.dumps({"style": request.style, "length": request.length}),
            content_json=json.dumps(summary),
            created_at=current_time,
            updated_at=current_time
        )
        db.add(new_asset)
        db.commit()

        return {
            "status": "success",
            "summary": summary
        }
    except Exception as e:
        print("ERROR TYPE:", type(e).__name__)
        print("ERROR MESSAGE:", str(e))
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )