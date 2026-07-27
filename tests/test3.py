print("Loading Start")

from pprint import pprint

from backend.services.paper_service import PaperService
from backend.rag.rag_service import RAGService
from backend.services.QnA_service import QnAService

from backend.services.summary_service import SummaryService
from backend.services.notes_service import NotesService
from backend.services.flashcard_service import FlashcardService
from backend.DocStore.paper_understaning import PaperUnderstandingService

from backend.llm.llm import get_llm

print("DONE")

llm = get_llm()

print("LETS START")

papers = PaperService.search("Attention is all you need")
paper_url = papers[0]["pdf_url"]
print("\n📄 Paper URL:")
print(paper_url)

bundle = RAGService.build(paper_url)
print("RAG built successfully")
understanding_service = (
    PaperUnderstandingService(llm)
)
paper_understanding = (
    understanding_service.generate(
        bundle.document_store,
        task_id="test-task"
    )
)
pprint(paper_understanding)

qna = QnAService(bundle.rag)
qna_result = qna.answer(
    question="Explain Transformer Architecture?",
    chat_history="User: Hello\nAssistant: Hi",
    paper_title="Attention Is All You Need",
    paper_metadata="Authors: Ashish Vaswani, et al. | Published Date: 2017"
)
print("\nQnA Answer:")
print(qna_result)

summary_service = SummaryService(llm)

summary = summary_service.generate(
    paper_understanding=paper_understanding,
    style="beginner-friendly",
    length="medium"
)

print("\n📝 SUMMARY")
print("=" * 80)
print(summary)

notes_service = NotesService(llm)
notes_result = (
    notes_service.generate(
        paper_understanding
    )
)

print("\n📚 NOTES")
print("=" * 80)
print(
    notes_result["notes"]
)
print("\n⭐ HIGHLIGHTS")
print("=" * 80)

pprint(
    notes_result["highlights"]
)

flashcard_service = FlashcardService(bundle.rag)
flashcards = (
    flashcard_service.generate_flashcards(
        count=5,
        difficulty="medium",
        question="Attention Mechanism"
    )
)

print("\n🧠 FLASHCARDS")
print("=" * 80)

print("\n🧠 Flashcards:")

for i, card in enumerate(flashcards, 1):
    print(f"\nCard {i}")
    print("Q:", card["question"])
    print("A:", card["answer"])