import os
import requests
from dotenv import load_dotenv

load_dotenv()

SEMANTIC_SCHOLAR_API_KEY = os.getenv("SEMANTIC_SCHOLAR_API_KEY")

def paper_search(
    query: str,
    limit: int = 20
):
    url = (
        "https://api.semanticscholar.org/"
        "graph/v1/paper/search"
    )
    headers = { "x-api-key": SEMANTIC_SCHOLAR_API_KEY}
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

    papers = []
    try:
        response = requests.get(
            url=url,
            headers=headers,
            params=params,
            timeout=30
        )
        response.raise_for_status()
        results = response.json().get(
            "data",
            []
        )
        for paper in results:
            pdf_url = ""
            # 1. Open Access PDF
            open_access = paper.get(
                "openAccessPdf"
            )
            if open_access:
                pdf_url = open_access.get(
                    "url",
                    ""
                )
            external_ids = paper.get(
                "externalIds",
                {}
            )
            # 2. ArXiv PDF
            if not pdf_url:
                arxiv_id = external_ids.get(
                    "ArXiv"
                )
                if arxiv_id:
                    pdf_url = (
                        f"https://arxiv.org/pdf/"
                        f"{arxiv_id}.pdf"
                    )
            
            # Skip papers without reliable direct PDF links
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
                    "doi": paper.get("externalIds", {}).get("DOI", ""),
                    "source": "Semantic Scholar"
                })

        papers.sort(
            key=lambda x:
            x["citation_count"],
            reverse=True
        )

        return papers

    except Exception as e:

        print(
            f"Semantic Scholar Error: {e}"
        )

        return []