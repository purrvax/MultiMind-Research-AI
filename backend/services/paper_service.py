from ai.document_search import paper_search
class PaperService:

    @staticmethod
    def search(query: str):
        return paper_search(query, limit=1)