import json


class PaperSynthesisService:

    def __init__(
        self,
        llm,
        batch_size=10
    ):
        self.llm = llm
        self.batch_size = batch_size

    def synthesize(
        self,
        structured_chunks
    ):

        batch_summaries = []

        for i in range(
            0,
            len(structured_chunks),
            self.batch_size
        ):

            batch = structured_chunks[
                i:i + self.batch_size
            ]

            result = self._synthesize_batch(
                batch
            )

            if result:
                batch_summaries.append(
                    result
                )

        if not batch_summaries:
            return {}

        return self._global_synthesis(
            batch_summaries
        )

    def _synthesize_batch(
        self,
        batch
    ):

        text = "\n\n".join(
            [
                f"""
CONCEPTS:
{", ".join(chunk.get("concepts", []))}

FACTS:
{", ".join(chunk.get("facts", []))}

SUMMARY:
{chunk.get("summary", "")}
"""
                for chunk in batch
            ]
        )

        prompt = f"""
You are analyzing multiple chunks from the same research paper.

Merge duplicate information and retain only the
most important technical content.

Return ONLY valid JSON.

Schema:

{{
    "core_concepts": [],
    "key_findings": [],
    "summary": ""
}}

IMPORTANT:

core_concepts must be a list of strings.

Correct:
["GraphRAG", "Community Detection"]

Incorrect:
[{{"name":"GraphRAG"}}]

key_findings must be a list of strings.

Rules:
- Deduplicate concepts.
- Ignore examples.
- Ignore fictional entities.
- Ignore company names used as examples.
- Keep only research-relevant concepts.
- Keep only important findings.
- Summary should describe the main ideas.
- Return JSON only.

{text}
"""

        try:

            response = (
                self.llm
                .invoke(prompt)
                .content
            )

            result = self._safe_json(
                response
            )

            result["core_concepts"] = (
                self._normalize_strings(
                    result.get(
                        "core_concepts",
                        []
                    )
                )
            )

            result["key_findings"] = (
                self._normalize_strings(
                    result.get(
                        "key_findings",
                        []
                    )
                )
            )

            return result

        except Exception as e:

            print(
                f"Batch synthesis error: {e}"
            )

            return {}

    def _global_synthesis(
        self,
        batch_summaries
    ):

        text = "\n\n".join(
            [
                f"""
CORE CONCEPTS:
{", ".join(
    self._normalize_strings(
        batch.get(
            "core_concepts",
            []
        )
    )
)}

KEY FINDINGS:
{", ".join(
    self._normalize_strings(
        batch.get(
            "key_findings",
            []
        )
    )
)}

SUMMARY:
{batch.get("summary", "")}
"""
                for batch in batch_summaries
            ]
        )

        prompt = f"""
You are an expert research-paper analyst.

You have been given summaries from
different sections of the same paper.

Create a complete understanding
of the paper.

Return ONLY valid JSON.

Schema:

{{
    "problem": "",
    "methodology": "",
    "datasets": [],
    "core_concepts": [],
    "key_findings": [],
    "limitations": [],
    "future_work": [],
    "conclusion": "",
    "paper_summary": ""
}}

Field Guidelines:

problem:
What challenge is the paper solving?

methodology:
Describe the proposed approach,
architecture, framework, or method.

datasets:
Mention datasets, benchmarks,
evaluation settings, or experiments.

core_concepts:
Important technical concepts.

key_findings:
Main results and contributions.

limitations:
Limitations explicitly discussed.

future_work:
Future directions mentioned.

conclusion:
Final takeaway.

paper_summary:
Overall summary.

IMPORTANT:

All list fields must contain strings only.

Correct:
["GraphRAG", "Community Detection"]

Incorrect:
[{{"name":"GraphRAG"}}]

Rules:
- Deduplicate information.
- Do not invent information.
- Ignore examples.
- Ignore fictional entities.
- Ignore illustrative stories.
- Return JSON only.

{text}
"""

        try:

            response = (
                self.llm
                .invoke(prompt)
                .content
            )

            result = self._safe_json(
                response
            )

            for field in [
                "datasets",
                "core_concepts",
                "key_findings",
                "limitations",
                "future_work"
            ]:

                result[field] = (
                    self._normalize_strings(
                        result.get(
                            field,
                            []
                        )
                    )
                )

            return result

        except Exception as e:

            print(
                f"Global synthesis error: {e}"
            )

            return {}

    def _normalize_strings(
        self,
        values
    ):

        normalized = []

        for item in values:

            if isinstance(
                item,
                str
            ):
                normalized.append(
                    item
                )

            elif isinstance(
                item,
                dict
            ):

                if "name" in item:
                    normalized.append(
                        str(item["name"])
                    )

                elif "concept" in item:
                    normalized.append(
                        str(item["concept"])
                    )

                elif "finding" in item:
                    normalized.append(
                        str(item["finding"])
                    )

                else:
                    normalized.append(
                        json.dumps(item)
                    )

            else:

                normalized.append(
                    str(item)
                )

        return normalized

    def _safe_json(
        self,
        text
    ):

        text = text.strip()

        try:
            return json.loads(
                text
            )

        except Exception:
            pass

        start = text.find("{")
        end = text.rfind("}")

        if (
            start != -1
            and end != -1
        ):

            try:

                return json.loads(
                    text[start:end + 1]
                )

            except Exception:
                pass

        return {}