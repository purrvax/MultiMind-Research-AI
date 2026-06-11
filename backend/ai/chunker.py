from collections import defaultdict
from langchain_text_splitters import RecursiveCharacterTextSplitter


class DocumentChunker:
    def __init__(
        self,
        chunk_size: int = 1000,
        chunk_overlap: int = 200,
    ):
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=[
                "\n\n",
                "\n",
                ". ",
                "; ",
                ", ",
                " ",
                "",
            ],
        )

    def chunk_documents(self, documents):
        """
        Split LangChain documents into chunks and attach stable chunk metadata.
        """
        chunks = self.splitter.split_documents(documents)
        counters = defaultdict(int)

        for chunk in chunks:
            metadata = chunk.metadata or {}
            source = metadata.get("source", "unknown")
            page = metadata.get("page", "unknown")
            key = (source, page)

            metadata["chunk_index"] = counters[key]
            metadata["source"] = source
            metadata["page"] = page
            chunk.metadata = metadata

            counters[key] += 1

        return chunks
