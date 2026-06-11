from backend.services.paper_service import PaperService
from backend.rag.rag_service import RAGService
from backend.llm.llm import get_llm
from backend.services.QnA_service import CONTEXTUAL_QA_PROMPT

print("Searching for papers...")
papers = PaperService.search("Attention is all you need")
print("\nProcessing first paper...")
paper_url = papers[0].get("pdf_url")
rag = RAGService.build(paper_url)
llm = get_llm()
QUERY = "What is Self Attention Mechanism?"
context, sources = rag.get_context(QUERY)
answer = llm.invoke(
    CONTEXTUAL_QA_PROMPT.format(
        context=context,
        question=QUERY
    )
)
print(f'Question: {QUERY}')
print("Generated Answer:")
print(answer.content)
