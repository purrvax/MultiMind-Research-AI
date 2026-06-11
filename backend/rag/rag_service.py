from backend.ai.chunker import DocumentChunker
from backend.ai.embeddings import (get_embedding_model)
from backend.ai.pdf_loader import (load_pdf,download_pdf)
from backend.ai.text_cleaner import PDFCleaner
from backend.ai.vector_store import (
    create_vector_store,
    load_vector_store,
    vector_store_has_documents,
    get_all_documents,
    get_paper_persist_directory,
    )
from backend.ai.retrievers.vector_retriever import (VectorRetriever)
from backend.ai.retrievers.bm25_retriever import (BM25Retriever)
from backend.ai.retrievers.hybrid_retriever import (HybridRetriever)
from backend.ai.rerankers.cross_encoder import (CrossEncoderReranker)
from backend.rag.rag_chain import (ResearchPaperRAG)

class RAGService:

    @staticmethod
    def build(pdf_url:str):

        embedding_model = get_embedding_model()
        persist_dir = (
            get_paper_persist_directory(
                pdf_url
            )
        )
        #Load cached vector store if it exists
        if vector_store_has_documents(
            embedding_model,
            persist_directory=persist_dir,
        ):
            print("Loading cached vector store...")
            vector_store = load_vector_store(
                embedding_model=embedding_model,
                persist_directory=persist_dir,
            )
        else:
        
        # Create new vector store 
            print("Creating new vector store...")
            pdf_path = download_pdf(pdf_url)
            documents = load_pdf(pdf_path)

            cleaned_docs = (PDFCleaner().clean_documents(documents))
            chunks = (DocumentChunker().chunk_documents(cleaned_docs))
            vector_store = create_vector_store(
                chunks = chunks,
                embedding_model=embedding_model,
                persist_directory=persist_dir,
                reset_existing=False
            )

            all_documents = (
                get_all_documents(
                    embedding_model = embedding_model,
                    persist_directory=persist_dir)
            )

            vector_retriever = (
                VectorRetriever(
                    vector_store = vector_store,
                    k=30,
                )
            )

            bm25_retriever = (
                BM25Retriever(
                    all_documents
                )
            )

            reranker = (
                CrossEncoderReranker()
            )

            hybrid_retriever = (
                HybridRetriever(
                    vector_retriever,
                    bm25_retriever,
                    reranker,
                    k=5,
                )
            )

            return ResearchPaperRAG(
                hybrid_retriever
            )