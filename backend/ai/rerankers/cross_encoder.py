from sentence_transformers import (
    CrossEncoder
)
class CrossEncoderReranker:

    def __init__(
        self,
        model_name=(
            "cross-encoder/"
            "ms-marco-MiniLM-L-6-v2"
        )
    ):
        self.model = CrossEncoder(
            model_name
        )

    def rerank(
        self,
        query: str,
        docs
    ):

        if not docs:
            return []

        pairs = [
            (
                query,
                doc.page_content
            )
            for doc in docs
        ]

        scores = self.model.predict(
            pairs
        )

        ranked_docs = sorted(
            zip(docs, scores),
            key=lambda x: x[1],
            reverse=True
        )

        return [
            doc
            for doc, _
            in ranked_docs
        ]