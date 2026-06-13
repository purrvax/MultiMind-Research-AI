from langchain_core.prompts import PromptTemplate

FLASHCARD_PROMPT = PromptTemplate(
    template="""
You are an expert educational AI that converts research content into high-quality flashcards.
You will be given retrieved excerpts from a research paper.

--------------------------------------------------
TASK

Create {count} flashcards from the given content.

Each flashcard must contain:
- question (front of card)
- answer (back of card)

--------------------------------------------------
DIFFICULTY LEVEL

Difficulty: {difficulty}

Adjust complexity based on difficulty:
- easy → simple definitions and basic concepts
- medium → conceptual + methodological understanding
- hard → deep technical + analytical questions

--------------------------------------------------
STRICT RULES

1. Use ONLY the provided excerpts.
2. Do NOT use external knowledge.
3. Do NOT invent facts or add missing information.
4. Each flashcard must be self-contained and meaningful.
5. Questions must be short and clear.
6. Answers must be concise (1–3 lines max).
7. Focus on:
   - key concepts
   - definitions
   - methodologies
   - important findings
   - equations (if present)
8. Avoid repetition across flashcards.
9. If content is insufficient, reduce the number of flashcards.

--------------------------------------------------
OUTPUT RULES (VERY IMPORTANT)

Return ONLY valid JSON.
No explanation.
No markdown.
No extra text.

Format:

[
  {{
    "question": "....",
    "answer": "...."
  }},
  {{
    "question": "....",
    "answer": "...."
  }}
]

--------------------------------------------------
RETRIEVED CONTEXT

{paper_input}
""",
    input_variables=["count", "difficulty", "paper_input"],
    validate_template=True,
)