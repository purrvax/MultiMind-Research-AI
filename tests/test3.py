print("Loading Start")

from pprint import pprint

from backend.services.paper_service import PaperService
from backend.rag.rag_service import RAGService
from backend.services.QnA_service import QnAService

from backend.services.summary_service import SummaryService
from backend.services.notes_service import NotesService
from backend.services.flashcard_service import FlashcardService

from backend.DocStore.synthesis import (
    PaperSynthesisService
)

from backend.DocStore.chunkintelligence import (
    ChunkIntelligenceEngine
)

from backend.llm.llm import get_llm

print("DONE")

llm = get_llm()

print("LETS START")

# --------------------------------------------------
# 1. SEARCH PAPER
# --------------------------------------------------

papers = PaperService.search("Attention is all you need")

paper_url = papers[0]["pdf_url"]

print("\n📄 Paper URL:")
print(paper_url)

# --------------------------------------------------
# 2. BUILD RAG
# --------------------------------------------------

context = RAGService.build(
    paper_url
)

rag = context.rag
doc_store = context.document_store

print("\n✅ RAG built successfully")

# --------------------------------------------------
# 3. QnA TEST
# --------------------------------------------------

qna = QnAService(rag)

qna_result = qna.answer(
    "Explain Transformer Architecture?"
)

print("\nQnA Answer:")
print(qna_result["answer"])

# --------------------------------------------------
# 4. CHUNK INTELLIGENCE
# --------------------------------------------------

print("\n🧠 Running Chunk Intelligence...")

engine = ChunkIntelligenceEngine(
    llm=llm,
    batch_size=10
)

structured_chunks = (
    engine.process_chunks(
        doc_store.chunks
    )
)

print(
    f"\n✅ Structured Chunks Generated: "
    f"{len(structured_chunks)}"
)
print("\nFIRST STRUCTURED CHUNK")
pprint(structured_chunks[0])
# --------------------------------------------------
# 5. PAPER SYNTHESIS
# --------------------------------------------------

print("\n📖 Synthesizing Paper Understanding...")

synthesis_service = (
    PaperSynthesisService(
        llm=llm
    )
)

paper_understanding = (
    synthesis_service.synthesize(
        structured_chunks
    )
)

print("\n✅ Paper Understanding Generated")

pprint(
    paper_understanding
)

# --------------------------------------------------
# 6. SUMMARY
# --------------------------------------------------

summary_service = SummaryService(
    llm
)

summary = summary_service.generate(
    paper_understanding=paper_understanding,
    style="Beginner-Friendly",
    length="medium"
)

print("\n📝 SUMMARY")
print("=" * 80)
print(summary)

# --------------------------------------------------
# 7. NOTES
# --------------------------------------------------

notes_service = NotesService()

notes_result = (
    notes_service.generate_notes(
        paper_understanding
    )
)

print("\n📚 NOTES")
print("=" * 80)
print(
    notes_result["notes"]
)

# --------------------------------------------------
# 8. HIGHLIGHTS
# --------------------------------------------------

print("\n⭐ HIGHLIGHTS")
print("=" * 80)

pprint(
    notes_result["highlights"]
)

# --------------------------------------------------
# 9. FLASHCARDS
# --------------------------------------------------

flashcard_service = FlashcardService(
    rag
)

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