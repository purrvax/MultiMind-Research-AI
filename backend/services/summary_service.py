class SummaryService:

    def __init__(self, llm):
        self.llm = llm

    def generate(
        self,
        paper_understanding,
        style="technical",
        length="medium"
    ):

        context = f"""
PROBLEM:
{paper_understanding.get("problem", "")}

METHODOLOGY:
{paper_understanding.get("methodology", "")}

DATASETS:
{chr(10).join('- ' + x for x in paper_understanding.get('datasets', []))}

CORE CONCEPTS:
{chr(10).join('- ' + x for x in paper_understanding.get('core_concepts', []))}

KEY FINDINGS:
{chr(10).join('- ' + x for x in paper_understanding.get('key_findings', []))}

LIMITATIONS:
{chr(10).join('- ' + x for x in paper_understanding.get('limitations', []))}

FUTURE WORK:
{chr(10).join('- ' + x for x in paper_understanding.get('future_work', []))}

CONCLUSION:
{paper_understanding.get("conclusion", "")}

PAPER SUMMARY:
{paper_understanding.get("paper_summary", "")}
"""

        prompt = f"""
You are an expert research paper summarizer.

STYLE: {style}
LENGTH: {length}

==================================================
STYLE GUIDELINES
==================================================

Beginner-Friendly:
- Explain concepts in simple language.
- Avoid unnecessary jargon.
- Explain technical terms.
- Focus on intuition and motivation.

Technical:
- Preserve terminology from the paper.
- Explain methodology, architecture, and findings.
- Suitable for engineers and researchers.
- Explain all technical terms.

Mathematical:
- Focus on equations, objective functions,
  derivations, proofs, and theoretical analysis.
- Proivde all mathematical expressions present with need
- For mathematical expressions:
- Use LaTeX notation.
- Inline equations: $...$
- Display equations: $$...$$
- Never write equations as plain text.

==================================================
LENGTH GUIDELINES
==================================================

concise:
- 150–250 words

medium:
- 300–600 words

detailed:
- 700+ words

==================================================
OUTPUT FORMAT
==================================================

# Paper Summary

## Overview
Brief overview of the paper.

## Problem Statement
What problem is being solved?

## Key Contribution
Main contribution or innovation.

## Methodology
Explain the proposed approach.

## Datasets / Experimental Setup
Mention datasets, benchmarks,
or evaluation setup.

If unavailable:
"Not clearly mentioned."

## Main Results
Summarize important findings.

## Limitations
Mention limitations if available.

If unavailable:
"Not clearly mentioned."

## Future Work
Mention future directions.

If unavailable:
"Not clearly mentioned."

## Conclusion
Summarize the final conclusions.

## Key Takeaways
Provide 3-5 concise bullet points.

==================================================
PAPER UNDERSTANDING
==================================================

{context}

Requirements:
- Follow requested style strictly.
- Do not invent information.
- Do not add external knowledge.
- Avoid repetition.
- Maintain academic structure.
- Respect the requested length.
"""

        return {
    "summary": self.llm.invoke(prompt).content
    }