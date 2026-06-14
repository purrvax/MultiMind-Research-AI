class NotesService:
    def generate(
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
        notes = {
            "problem":
                paper_understanding.get(
                    "problem",
                    ""
                ),
            "methodology":
                paper_understanding.get(
                    "methodology",
                    ""
                ),
            "key_concepts":
                concepts,
            "important_findings":
                findings,
            "limitations":
                limitations,
            "conclusion":
                paper_understanding.get(
                    "conclusion",
                    ""
                )
        }

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