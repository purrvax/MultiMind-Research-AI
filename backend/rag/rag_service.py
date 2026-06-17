"""
RAG Service: builds vector DB + retrievers + document store + RAG engine
"""

from ai.chunker import DocumentChunker
from ai.embeddings import get_embedding_model
from ai.pdf_loader import load_pdf, download_pdf
from ai.text_cleaner import PDFCleaner
from ai.vector_store import (
    create_vector_store,
    load_vector_store,
    vector_store_has_documents,
    get_all_documents,
    get_paper_persist_directory,
    load_paper_understanding
)
from ai.retrievers.vector_retriever import VectorRetriever
from ai.retrievers.bm25_retriever import BM25Retriever
from ai.retrievers.hybrid_retriever import HybridRetriever
from ai.rerankers.cross_encoder import CrossEncoderReranker
from rag.rag_cache import RAGCache
from rag.rag_chain import ResearchPaperRAG
from DocStore.document_store import DocumentStore

class RAGBundle:
    """
    Single object holding everything needed:
    - RAG engine
    - retriever
    - document store
    """
    def __init__(self, rag, retriever, document_store , paper_understanding = None):
        self.rag = rag
        self.retriever = retriever
        self.document_store = document_store
        self.paper_understanding = paper_understanding


class RAGService:

    @staticmethod
    def build(pdf_url: str):
        cached_rag = RAGCache.get(pdf_url)
        if cached_rag:
            print("Returning cached RAG")
            return cached_rag

        # INIT MODELS
        embedding_model = get_embedding_model()
        persist_dir = get_paper_persist_directory(pdf_url)
        paper_understanding = load_paper_understanding(pdf_url)

        # LOAD OR CREATE VECTOR STORE
        if vector_store_has_documents(
            embedding_model,
            persist_directory=persist_dir,
        ):
            print("Loading cached vector store...")

            vector_store = load_vector_store(
                embedding_model=embedding_model,
                persist_directory=persist_dir,
            )

            all_documents = get_all_documents(
                embedding_model=embedding_model,
                persist_directory=persist_dir,
            )

            clean_docs = all_documents.get("clean_docs", "")
            chunks = all_documents.get("chunks", [])

        else:
            print("Creating new vector store...")

            pdf_path = download_pdf(pdf_url)
            documents = load_pdf(pdf_path)

            clean_docs = PDFCleaner().clean_documents(documents)

            chunks = DocumentChunker().chunk_documents(clean_docs)

            vector_store = create_vector_store(
                chunks=chunks,
                embedding_model=embedding_model,
                persist_directory=persist_dir,
                reset_existing = False
            )

        # RETRIEVERS
        vector_retriever = VectorRetriever(vector_store, k=30)
        bm25_retriever = BM25Retriever(chunks)
        reranker = CrossEncoderReranker()
        hybrid_retriever = HybridRetriever(
            vector_retriever,
            bm25_retriever,
            reranker,
            k=5,
        )
        # RAG ENGINE
        rag = ResearchPaperRAG(hybrid_retriever)

        # DOCUMENT STORE 
        document_store = DocumentStore(chunks)
        bundle = RAGBundle(
            rag=rag,
            retriever=hybrid_retriever,
            document_store=document_store,
            paper_understanding=paper_understanding
        )
        RAGCache.set(
            pdf_url,
            bundle
        )
        return bundle