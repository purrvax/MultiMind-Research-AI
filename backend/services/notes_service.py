import json

class NotesService:
    def __init__(self, llm):
        self.llm = llm

    def generate(self, paper_understanding):
        concepts = paper_understanding.get("core_concepts", [])
        findings = paper_understanding.get("key_findings", [])
        limitations = paper_understanding.get("limitations", [])

        prompt = f"""
        You are an elite research-paper tutor and university professor.

        Your job is to convert a research paper analysis into HIGH-QUALITY EXAM STUDY NOTES.

        IMPORTANT:

        * Return ONLY valid JSON.
        * No markdown.
        * No code fences.
        * No explanations outside JSON.
        * Focus on LEARNING, UNDERSTANDING, and REVISION.
        * Notes should feel like material a student would study before an exam.
        * Do NOT simply summarize the paper.
        * Teach the concepts.

        Return JSON in EXACTLY this format:

        {{
        "overview": {{
        "paper_goal": "",
        "main_contribution": "",
        "why_it_matters": ""
        }},

        "problem_statement": [
        ""
        ],

        "methodology_breakdown": [
        {{
        "step": "",
        "description": "",
        "purpose": ""
        }}
        ],

        "core_concepts": [
        {{
        "title": "",
        "definition": "",
        "how_it_works": "",
        "why_it_matters": "",
        "example": "",
        "exam_tip": ""
        }}
        ],

        "key_findings": [
        {{
        "finding": "",
        "interpretation": "",
        "significance": ""
        }}
        ],

        "limitations": [
        {{
        "limitation": "",
        "impact": ""
        }}
        ],

        "revision_notes": [
        ""
        ],

        "possible_exam_questions": [
        {{
        "question": "",
        "answer": ""
        }}
        ],

        "quick_revision_sheet": {{
        "must_remember": [
        ""
        ],
        "important_terms": [
        ""
        ],
        "key_takeaways": [
        ""
        ]
        }}
        }}

        INSTRUCTIONS:

        1. OVERVIEW

        * Explain the goal of the paper.
        * Explain the main contribution.
        * Explain why the work is important.

        2. PROBLEM STATEMENT

        * Break the research problem into clear points.
        * Explain what challenge the authors are solving.

        3. METHODOLOGY BREAKDOWN

        * Explain the method step-by-step.
        * Each step must contain:

        * what happens
        * why it is needed

        4. CORE CONCEPTS
        For every important concept:

        * Definition (40-80 words)
        * How it works (80-150 words)
        * Why it matters (30-60 words)
        * Example (simple student-friendly example)
        * Exam Tip (memory trick or revision hint)

        5. KEY FINDINGS

        * Explain the result.
        * Explain what it means.
        * Explain why researchers care.

        6. LIMITATIONS

        * Explain the limitation.
        * Explain its practical impact.

        7. REVISION NOTES

        * Create concise revision bullets.
        * Include formulas, architectures, workflows, and important facts.

        8. POSSIBLE EXAM QUESTIONS
        Generate 8-15 exam-style questions.
        Mix:

        * Conceptual questions
        * Short answer questions
        * Long answer questions
        * Comparison questions

        Each question MUST include a model answer.

        9. QUICK REVISION SHEET
        Create a last-minute revision section.

        Paper Analysis:

        Problem:
        {paper_understanding.get("problem", "")}

        Methodology:
        {paper_understanding.get("methodology", "")}

        Core Concepts:
        {concepts}

        Key Findings:
        {findings}

        Limitations:
        {limitations}

        Conclusion:
        {paper_understanding.get("conclusion", "")}
        """

        try:
            response = self.llm.invoke(prompt)
            if hasattr(response, "content"):
                content = response.content
            else:
                content = str(response)
            notes = json.loads(content)

        except Exception:
            notes = {
                "problem": [
                    paper_understanding.get("problem", "")
                ],
                "methodology": [
                    paper_understanding.get("methodology", "")
                ],
                "core_concepts": [
                    {
                        "title": concept,
                        "explanation": ""
                    }
                    for concept in concepts[:15]
                ],
                "key_findings": [
                    {
                        "finding": finding,
                        "significance": ""
                    }
                    for finding in findings[:15]
                ],
                "limitations": limitations,
                "conclusion": [
                    paper_understanding.get("conclusion", "")
                ]
            }

        highlights = {
            "key_concepts": concepts[:10],
            "key_findings": findings[:10],
            "total_concepts": len(concepts),
            "total_findings": len(findings)
        }

        return {
            "status": "success",
            "notes": notes,
            "highlights": highlights
        }
