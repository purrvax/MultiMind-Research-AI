class NotesService:

    def generate_notes(
        self,
        paper_understanding
    ):

        concepts = paper_understanding.get(
            "core_concepts",
            []
        )

        findings = paper_understanding.get(
            "key_findings",
            []
        )

        limitations = paper_understanding.get(
            "limitations",
            []
        )

        notes = f"""
# Study Notes

## Problem
{paper_understanding.get("problem", "")}

## Methodology
{paper_understanding.get("methodology", "")}

## Key Concepts
{chr(10).join(f"- {x}" for x in concepts)}

## Important Findings
{chr(10).join(f"- {x}" for x in findings)}

## Limitations
{chr(10).join(f"- {x}" for x in limitations)}

## Conclusion
{paper_understanding.get("conclusion", "")}
"""

        highlights = {
            "key_concepts": concepts[:10],
            "key_findings": findings[:10],
            "total_concepts": len(concepts),
            "total_findings": len(findings)
        }

        return {
            "notes": notes,
            "highlights": highlights
        }