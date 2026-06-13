from fastapi import APIRouter
from pydantic import BaseModel
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