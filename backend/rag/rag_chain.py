"""
Core RAG object for retrieval + context building
"""
class ResearchPaperRAG:
    def __init__(self, retriever):
        self.retriever = retriever
    def retrieve(self, query: str):
        return self.retriever.retrieve(query)
    def build_context(self, docs):
        """
        Convert retrieved documents into:
        - context (string)
        - sources (metadata)
        """

        context_chunks = []
        sources = []

        for doc in docs:
            context_chunks.append(doc.page_content)

            sources.append({
                "source": doc.metadata.get("source"),
                "page": doc.metadata.get("page"),
                "chunk_index": doc.metadata.get("chunk_index"),
                "preview": (
                    doc.page_content[:200] + "..."
                    if len(doc.page_content) > 200
                    else doc.page_content
                ),
            })

        context = "\n\n".join(context_chunks)

        return context, sources

    def get_context(self, query: str):
        docs = self.retrieve(query)
        return self.build_context(docs)