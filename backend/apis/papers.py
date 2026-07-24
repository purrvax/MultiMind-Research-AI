import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

import database
from services.auth_service import get_current_user
from ai.document_search import paper_search

router = APIRouter()

class PaperQuery(BaseModel):
    query: str
    limit: int = 10

@router.post("/search-papers")
def search_papers(data: PaperQuery):
    results = paper_search(
        query=data.query,
        limit=data.limit
    )
    return {
        "papers": results
    }

@router.get("/papers/history")
def get_papers_history(
    current_user = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """Retrieve history of papers accessed by the current user"""
    user_papers = db.query(database.UserPaper, database.Paper).join(
        database.Paper, database.UserPaper.paper_id == database.Paper.id
    ).filter(
        database.UserPaper.user_id == current_user.id
    ).order_by(
        database.UserPaper.last_opened_at.desc()
    ).all()
    
    history = []
    for up, p in user_papers:
        try:
            authors_val = json.loads(p.authors) if p.authors else []
        except Exception:
            authors_val = p.authors
            
        history.append({
            "id": p.id,
            "title": p.title,
            "pdf_url": p.paper_url,
            "year": p.published_date,
            "authors": authors_val,
            "abstract": p.abstract,
            "source": p.source,
            "last_opened_at": up.last_opened_at
        })
    return {"history": history}

@router.get("/papers/{paper_id}/chat")
def get_paper_chat_history(
    paper_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """Retrieve chat history for a specific paper and user"""
    messages = db.query(database.ChatMessage).filter(
        database.ChatMessage.user_id == current_user.id,
        database.ChatMessage.paper_id == paper_id
    ).order_by(database.ChatMessage.id.asc()).all()
    
    return {
        "messages": [
            {
                "id": msg.id,
                "role": msg.role,
                "content": msg.content,
                "created_at": msg.created_at
            }
            for msg in messages
        ]
    }