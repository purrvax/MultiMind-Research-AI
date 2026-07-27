"""
QnA service for research paper RAG system
"""
from llm.llm import get_llm
from prompts.QnA_prompt import CONTEXTUAL_QA_PROMPT


class QnAService:
    def __init__(self, rag):
        self.rag = rag
        self.llm = get_llm()

    def answer(self, question: str, chat_history: str, paper_title: str, paper_metadata: str):
        context, _ = self.rag.get_context(question)

        prompt = CONTEXTUAL_QA_PROMPT.format(
            paper_title=paper_title or "Unknown Title",
            paper_metadata=paper_metadata or "None",
            chat_history=chat_history or "No previous history.",
            context=context or "No context retrieved.",
            question=question
        )

        response = self.llm.invoke(prompt)
        return response.content