"""
QnA service for research paper RAG system
"""
from llm.llm import get_llm
from prompts.QnA_prompt import CONTEXTUAL_QA_PROMPT


class QnAService:
    def __init__(self, rag):
        self.rag = rag
        llm = get_llm()
        self.qna_chain = CONTEXTUAL_QA_PROMPT | llm

    def answer(self, question: str):
        context, _ = self.rag.get_context(question)

        response = self.qna_chain.invoke(
            {
                "context": context,
                "question": question,
            }
        )
        return response.content