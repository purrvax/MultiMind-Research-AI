import re
from langchain_core.documents import Document

class PDFCleaner:

    @staticmethod
    def clean_text(text: str) -> str:
        """
        Clean extracted PDF text.
        """

        if not text:
            return ""

        # Remove arXiv metadata
        text = re.sub(
            r'arXiv:\d+\.\d+(v\d+)?',
            '',
            text
        )
        # Remove page numbers
        text = re.sub(
            r'\n\s*\d+\s*\n',
            '\n',
            text
        )
        # Fix broken words
        # Example:
        # Retrie-
        # val -> Retrieval
        text = re.sub(
            r'(\w+)-\s+(\w+)',
            r'\1\2',
            text
        )
        # Remove URLs
        text = re.sub(
            r'http[s]?://\S+',
            '',
            text
        )
        # Remove emails
        text = re.sub(
            r'\S+@\S+',
            '',
            text
        )
        # Remove multiple spaces
        text = re.sub(
            r'[ \t]+',
            ' ',
            text
        )
        # Remove excessive newlines
        text = re.sub(
            r'\n{3,}',
            '\n\n',
            text
        )
        # Remove repeated dots
        text = re.sub(
            r'\.{3,}',
            '.',
            text
        )

        return text.strip()

    @staticmethod
    def is_blank_page(
        text: str,
        min_chars: int = 100
    ) -> bool:

        return len(text.strip()) < min_chars
    @classmethod
    def clean_documents(
        cls,
        documents
    ):
        """
        Clean LangChain documents.
        """

        cleaned_docs = []

        for doc in documents:

            text = doc.page_content

            # Skip blank pages
            if cls.is_blank_page(text):
                continue

            cleaned_text = cls.clean_text(
                text
            )

            if len(cleaned_text) < 100:
                continue

            cleaned_docs.append(
                Document(
                    page_content=cleaned_text,
                    metadata=doc.metadata
                )
            )

        return cleaned_docs
