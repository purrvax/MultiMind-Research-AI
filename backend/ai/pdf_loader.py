import os
import requests
from langchain_community.document_loaders import PyMuPDFLoader

def download_pdf(
    pdf_url: str,
    save_dir: str = "uploads",
    timeout: int = 30
):

    if not pdf_url:
        raise ValueError("PDF URL is required")

    os.makedirs(save_dir, exist_ok=True)

    filename = pdf_url.split("/")[-1]

    if not filename.endswith(".pdf"):
        filename += ".pdf"

    path = os.path.join(save_dir, filename)

    headers = {
        "User-Agent": "Mozilla/5.0"
    }

    try:
        response = requests.get(
            pdf_url,
            headers=headers,
            timeout=timeout,
            allow_redirects=True
        )

        response.raise_for_status()

    except requests.RequestException as e:
        raise RuntimeError(
            f"Failed to download PDF: {e}"
        ) from e

    if b"%PDF" not in response.content[:100]:
        raise ValueError(
            "Not a valid PDF response"
        )

    with open(path, "wb") as f:
        f.write(response.content)

    return path


def load_pdf(pdf_path: str):
    """
    Load PDF and return LangChain documents.
    """

    if not os.path.exists(pdf_path):
        raise FileNotFoundError(
            f"PDF not found: {pdf_path}"
        )

    loader = PyMuPDFLoader(pdf_path)
    documents = loader.load()

    for doc in documents:
        doc.metadata["source"] = pdf_path

    return documents