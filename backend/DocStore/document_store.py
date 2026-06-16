class DocumentStore:
    def __init__(self, chunks: list):
        self.chunks = chunks
        self.chunk_count = len(chunks)

    def get_all_chunks(self):
        return self._chunks

    def get_chunk(self, idx: int):
        return self._chunks[idx]