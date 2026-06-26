import re
from cancel_manager import CancellationError, is_cancelled

class ChunkIntelligenceEngine:

    def __init__(
        self,
        llm,
        batch_size=5,
        chunk_char_limit=2500
    ):
        self.llm = llm
        self.batch_size = batch_size
        self.chunk_char_limit = chunk_char_limit

    def process_chunks(
        self,
        chunks,
        task_id=None
    ):
        structured_chunks = []
        total_batches = (
            len(chunks) + self.batch_size - 1
        ) // self.batch_size

        for batch_num, i in enumerate(
            range(
                0,
                len(chunks),
                self.batch_size
            ),
            start=1
        ):
            if task_id and is_cancelled(task_id):
                print(f"cancellation detected: {task_id}")
                raise CancellationError()

            batch = chunks[
                i:i + self.batch_size
            ]

            print(
                f"Processing Batch "
                f"{batch_num}/{total_batches}"
            )

            text = "\n\n".join(
                [
                    f"""
CHUNK {idx}

{chunk.page_content[:self.chunk_char_limit]}
"""
                    for idx, chunk in enumerate(
                        batch,
                        start=i + 1
                    )
                ]
            )

            prompt = f"""
You are an expert research paper analyst.

Analyze EACH chunk independently.

Extract ONLY information useful for understanding
the research paper.

CONCEPTS:
Extract:
- algorithms
- methods
- architectures
- frameworks
- datasets
- evaluation metrics
- important technical terms

Ignore:
- example companies
- fictional entities
- illustrative examples
- benchmark stories
- random names from examples

FINDINGS:
Extract:
- key observations
- experimental results
- contributions
- conclusions

SUMMARY:
Provide a concise 2-4 sentence summary.

STRICT OUTPUT FORMAT:

CHUNK: <number>

CONCEPTS:
- item

FINDINGS:
- item

SUMMARY:
paragraph

Rules:
- Return one section for EVERY chunk.
- Follow the format exactly.
- Do not skip chunks.
- Do not use markdown headers.
- Do not use code blocks.

{text}
"""
            try:

                response = (
                    self.llm
                    .invoke(prompt)
                    .content
                )
                if task_id and is_cancelled(task_id):
                    print(f"cancellation detected: {task_id}")
                    raise CancellationError()

            except Exception as e:
                if isinstance(e, CancellationError):
                    raise

                print(
                    f"Batch {batch_num} failed: {e}"
                )

                continue

            blocks = re.split(
                r"CHUNK:\s*\d+",
                response,
                flags=re.IGNORECASE
            )

            chunk_id = i + 1

            for block in blocks:

                if not block.strip():
                    continue

                parsed = self._parse_block(
                    block
                )

                if (
                    not parsed["concepts"]
                    and not parsed["findings"]
                    and not parsed["summary"]
                ):
                    parsed["summary"] = (
                        block.strip()
                    )

                parsed["chunk_id"] = (
                    chunk_id
                )

                if (
                    chunk_id - 1
                    < len(chunks)
                ):
                    parsed["source_text"] = (
                        chunks[
                            chunk_id - 1
                        ].page_content[
                            :self.chunk_char_limit
                        ]
                    )

                structured_chunks.append(
                    parsed
                )

                chunk_id += 1

        return structured_chunks

    def _extract_section(
        self,
        text,
        start,
        end=None
    ):

        if end:

            pattern = (
                rf"{start}\s*:(.*?)"
                rf"{end}\s*:"
            )

        else:

            pattern = (
                rf"{start}\s*:(.*)"
            )

        match = re.search(
            pattern,
            text,
            re.DOTALL | re.IGNORECASE
        )

        if not match:
            return ""

        return (
            match
            .group(1)
            .strip()
        )

    def _parse_list(
        self,
        text
    ):

        items = []

        for line in text.split("\n"):

            line = line.strip()

            if line.startswith("-"):

                item = (
                    line[1:]
                    .strip()
                )

                if (
                    item
                    and item.lower() != "none"
                ):
                    items.append(
                        item
                    )

        return items

    def _parse_block(
        self,
        block
    ):

        concepts = (
            self._extract_section(
                block,
                "CONCEPTS",
                "FINDINGS"
            )
        )

        findings = (
            self._extract_section(
                block,
                "FINDINGS",
                "SUMMARY"
            )
        )

        summary = (
            self._extract_section(
                block,
                "SUMMARY"
            )
        )

        if not summary:
            summary = block.strip()

        return {
            "concepts": self._parse_list(
                concepts
            ),
            "findings": self._parse_list(
                findings
            ),
            "summary": summary.strip()
        }
