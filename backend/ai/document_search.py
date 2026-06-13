import os
import requests
import arxiv
from dotenv import load_dotenv

load_dotenv()

SEMANTIC_SCHOLAR_API_KEY = os.getenv("SEMANTIC_SCHOLAR_API_KEY")


def search_arxiv(query: str, limit: int = 20):
    papers = []

    try:
        client = arxiv.Client()

        search = arxiv.Search(
            query=query,
            max_results=limit,
            sort_by=arxiv.SortCriterion.Relevance
        )

        for result in client.results(search):
            papers.append({
                "title": result.title,
                "authors": [author.name for author in result.authors],
                "abstract": result.summary,
                "year": result.published.year,
                "citation_count": 0,
                "pdf_url": result.pdf_url,
                "paper_url": result.entry_id,
                "doi": getattr(result, "doi", "") or "",
                "source": "arXiv"
            })

    except Exception:
        pass

    return papers


def paper_search(query: str, limit: int = 20):
    url = "https://api.semanticscholar.org/graph/v1/paper/search"

    headers = {}
    if SEMANTIC_SCHOLAR_API_KEY:
        headers["x-api-key"] = SEMANTIC_SCHOLAR_API_KEY

    params = {
        "query": query,
        "limit": limit,
        "fields": (
            "title,"
            "authors,"
            "abstract,"
            "year,"
            "citationCount,"
            "openAccessPdf,"
            "externalIds,"
            "url"
        )
    }

    try:
        response = requests.get(
            url=url,
            headers=headers,
            params=params,
            timeout=30
        )

        if response.status_code == 429:
            return search_arxiv(query, limit)

        response.raise_for_status()

        results = response.json().get("data", [])
        papers = []

        for paper in results:
            pdf_url = ""

            open_access = paper.get("openAccessPdf")
            if open_access:
                pdf_url = open_access.get("url", "")

            external_ids = paper.get("externalIds", {})

            if not pdf_url:
                arxiv_id = external_ids.get("ArXiv")
                if arxiv_id:
                    pdf_url = f"https://arxiv.org/pdf/{arxiv_id}.pdf"

            if not pdf_url:
                continue

            papers.append({
                "title": paper.get("title", ""),
                "authors": [
                    author.get("name", "")
                    for author in paper.get("authors", [])
                ],
                "abstract": paper.get("abstract", ""),
                "year": paper.get("year"),
                "citation_count": paper.get("citationCount", 0),
                "pdf_url": pdf_url,
                "paper_url": paper.get("url", ""),
                "doi": external_ids.get("DOI", ""),
                "source": "Semantic Scholar"
            })

        papers.sort(
            key=lambda x: x["citation_count"],
            reverse=True
        )

        return papers if papers else search_arxiv(query, limit)

    except Exception:
        return search_arxiv(query, limit)