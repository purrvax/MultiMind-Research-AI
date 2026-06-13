"""
Flashcard generation service using RAG retrieval
"""
import json
from backend.llm.llm import get_llm
from backend.prompts.flashcard_prompt import FLASHCARD_PROMPT
class FlashcardService:
    def __init__(self, rag):
        self.rag = rag
        llm = get_llm()
        self.flashcard_chain = FLASHCARD_PROMPT | llm
    def generate_flashcards(
        self,
        question: str,
        difficulty: str = "medium",
        count: int = 10,
    ) -> list[dict]:
        context, _ = (
        self.rag.get_context(question)
        )
        response = self.flashcard_chain.invoke(
            {
                "count": count,
                "difficulty": difficulty,
                "paper_input": context,
            }
        )
        try:
            return json.loads(response.content)
        except Exception:
            return self._parse_fallback(response.content)
    def _parse_fallback(self, text: str):
        cards = []
        blocks = text.split("Flashcard")

        for block in blocks:
            if "Q:" in block and "A:" in block:
                try:
                    q = block.split("Q:")[1].split("A:")[0].strip()
                    a = block.split("A:")[1].strip()

                    cards.append({
                        "question": q,
                        "answer": a
                    })
                except:
                    continue

        return cards