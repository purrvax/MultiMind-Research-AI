from typing import List


class VectorRetriever:

    def __init__(
        self,
        vector_store,
        k: int = 20
    ):
        self.vector_store = vector_store
        self.k = k

    def retrieve(
        self,
        query: str
    ) -> List:

        return self.vector_store.similarity_search(
            query=query,
            k=self.k
        )