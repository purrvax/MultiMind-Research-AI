class HybridRetriever:

    def __init__(
        self,
        vector_retriever,
        bm25_retriever,
        reranker,
        k: int = 5
    ):
        self.vector_retriever = (
            vector_retriever
        )

        self.bm25_retriever = (
            bm25_retriever
        )

        self.reranker = reranker

        self.k = k

    def _deduplicate(
        self,
        docs
    ):

        unique_docs = {}

        for doc in docs:

            source = (
                doc.metadata.get(
                    "source",
                    ""
                )
            )

            page = (
                doc.metadata.get(
                    "page",
                    ""
                )
            )

            chunk_index = (
                doc.metadata.get(
                    "chunk_index",
                    ""
                )
            )

            key = (
                f"{source}_"
                f"{page}_"
                f"{chunk_index}"
            )

            unique_docs[key] = doc

        return list(
            unique_docs.values()
        )

    def retrieve(
        self,
        query: str
    ):

        vector_docs = (
            self.vector_retriever
            .retrieve(query)
        )

        bm25_docs = (
            self.bm25_retriever
            .retrieve(query)
        )

        candidates = (
            vector_docs
            +
            bm25_docs
        )

        candidates = (
            self._deduplicate(
                candidates
            )
        )

        reranked_docs = (
            self.reranker.rerank(
                query,
                candidates
            )
        )

        return reranked_docs[:self.k]