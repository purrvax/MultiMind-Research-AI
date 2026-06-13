from backend.ai.document_search import paper_search
from backend.ai.embeddings import get_embedding_model
from backend.ai.pdf_loader import (load_pdf, download_pdf)
from backend.ai.text_cleaner import PDFCleaner
from backend.ai.chunker import DocumentChunker
from backend.ai.vector_store import create_vector_store
from backend.rag.rag_service import RAGService
from backend.llm.llm import get_llm
from langchain_core.prompts import PromptTemplate

print("Searching for papers...")
papers = paper_search("Attention is all you need", limit=1)
print("\nProcessing first paper...")
paper_url = papers[0].get("pdf_url")
print(f"Downloading PDF from: {paper_url}")
pdf_path = download_pdf(paper_url)
print(f"PDF downloaded to: {pdf_path}")
documents = load_pdf(pdf_path)
print(f"Extracted {len(documents)} documents from PDF")
cleaned_documents = PDFCleaner().clean_documents(documents)
print(f"Cleaned documents. Sample text:\n{cleaned_documents[0].page_content[:500]}")
print(f"Number of cleaned documents: {len(cleaned_documents)}")
chunks = DocumentChunker().chunk_documents(cleaned_documents)
print(f"Number of chunks: {len(chunks)}")
print("\nLoading embedding model...")
embedding_model = get_embedding_model()
print("Embedding model loaded")
vector_store = create_vector_store(
    chunks=chunks,
    embedding_model=embedding_model
)
print("Vector store created")
rag = RAGService.build()
context, sources = rag.get_context(
    "What is Deep Learning?"
)
llm = get_llm()

CONTEXTUAL_QA_PROMPT = PromptTemplate(
    template="""
You are a STRICT research-paper QA system.

RULES:

1. Use ONLY the provided context excerpts.
2. Do NOT use any external knowledge.
3. If the answer is not explicitly stated in the context, respond exactly:
   "Not found in the provided paper excerpts."
4. Keep answers concise and technical.
5. Do NOT mention sources, citations, references, evidence, limitations, confidence scores, or reasoning.
6. Do NOT explain concepts beyond what is stated in the context.
7. Merge duplicate information and avoid repetition.
8. Return only the final answer.

OUTPUT FORMAT:

### Answer

* Point 1
* Point 2
* Point 3

OR

### Answer

Single concise paragraph.

OR

### Answer

Not found in the provided paper excerpts.
CONTEXT
{context}

QUESTION
{question}
""",
    input_variables=["context", "question"],
)
QUERY = "Explain Transformer architecture"
answer = llm.invoke(
    CONTEXTUAL_QA_PROMPT.format(
        context=context,
        question=QUERY
    )
)
print(f'Question: {QUERY}')
print("Generated Answer:")
print(answer.content)