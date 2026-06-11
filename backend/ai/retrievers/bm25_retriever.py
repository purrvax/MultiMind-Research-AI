from rank_bm25 import BM25Okapi

class BM25Retriever:

    def __init__(self, documents):
        self.documents = documents

        self.tokenized_docs = [
            doc.page_content.lower().split()
            for doc in documents
        ]

        self.bm25 = BM25Okapi(
            self.tokenized_docs
        )

    def retrieve(
        self,
        query: str,
        k: int = 20
    ):
        query_tokens = query.lower().split()

        scores = self.bm25.get_scores(
            query_tokens
        )

        ranked_indices = sorted(
            range(len(scores)),
            key=lambda i: scores[i],
            reverse=True
        )

        return [
            self.documents[i]
            for i in ranked_indices[:k]
        ]