from pathlib import Path
import shutil
import hashlib
import json
from langchain_chroma import Chroma
from langchain_core.documents import Document
from storage_config import CHROMA_DIR, DATA_DIR

DEFAULT_PERSIST_DIRECTORY = CHROMA_DIR
DEFAULT_COLLECTION_NAME = "research_papers"


# -------------------------------------------------
# CREATE VECTOR STORE
# -------------------------------------------------
def create_vector_store(
    chunks,
    embedding_model,
    persist_directory=DEFAULT_PERSIST_DIRECTORY,
    collection_name=DEFAULT_COLLECTION_NAME,
    reset_existing=False,
):
    """
    Create a Chroma vector store from chunks.
    """

    if not chunks:
        raise ValueError("Cannot create vector store without chunks.")

    persist_path = Path(persist_directory)
    persist_path.mkdir(parents=True, exist_ok=True)

    if reset_existing:
        # delete old DB safely
        try:
            shutil.rmtree(persist_path)
        except Exception:
            pass

        persist_path.mkdir(parents=True, exist_ok=True)

    vector_store = Chroma(
        embedding_function=embedding_model,
        persist_directory=str(persist_path),
        collection_name=collection_name,
    )

    add_documents(vector_store, chunks)

    return vector_store


# -------------------------------------------------
# LOAD VECTOR STORE
# -------------------------------------------------
def load_vector_store(
    embedding_model,
    persist_directory=DEFAULT_PERSIST_DIRECTORY,
    collection_name=DEFAULT_COLLECTION_NAME,
):
    """
    Load existing Chroma vector store.
    """

    persist_path = Path(persist_directory)

    if not persist_path.exists():
        raise FileNotFoundError(f"Vector store not found: {persist_path}")

    return Chroma(
        embedding_function=embedding_model,
        persist_directory=str(persist_path),
        collection_name=collection_name,
    )


# -------------------------------------------------
# ADD DOCUMENTS (DEDUP SAFE)
# -------------------------------------------------
def add_documents(vector_store, chunks):
    """
    Add documents while skipping duplicates.
    """

    if not chunks:
        return

    chunk_ids = [_stable_chunk_id(chunk) for chunk in chunks]

    existing_ids = set()

    try:
        existing = vector_store.get(ids=chunk_ids)
        existing_ids = set(existing.get("ids", []))
    except Exception:
        existing_ids = set()

    new_docs = []
    new_ids = []

    for chunk, chunk_id in zip(chunks, chunk_ids):
        if chunk_id in existing_ids:
            continue

        new_docs.append(chunk)
        new_ids.append(chunk_id)

    if not new_docs:
        return

    vector_store.add_documents(
        documents=new_docs,
        ids=new_ids,
    )


# -------------------------------------------------
# GET ALL DOCUMENTS (SAFE VERSION)
# -------------------------------------------------
def get_all_documents(
    embedding_model,
    persist_directory=DEFAULT_PERSIST_DIRECTORY,
    collection_name=DEFAULT_COLLECTION_NAME,
):
    """
    Load all documents from Chroma safely.
    Used for BM25 or rebuilding chunks.
    """

    vector_store = load_vector_store(
        embedding_model,
        persist_directory,
        collection_name,
    )

    results = vector_store.get(include=["documents", "metadatas"])

    docs = results.get("documents", [])
    metadatas = results.get("metadatas", [])

    chunks = []

    for content, metadata in zip(docs, metadatas):
        chunks.append(
            Document(
                page_content=content or "",
                metadata=metadata or {},
            )
        )

    return {
        "chunks": chunks,
        "clean_docs": "\n\n".join(docs),
    }


# -------------------------------------------------
# CHECK IF VECTOR STORE EXISTS
# -------------------------------------------------
def vector_store_has_documents(
    embedding_model,
    persist_directory=DEFAULT_PERSIST_DIRECTORY,
    collection_name=DEFAULT_COLLECTION_NAME,
):
    """
    Check if vector store has any data.
    """

    try:
        vector_store = load_vector_store(
            embedding_model,
            persist_directory,
            collection_name,
        )

        return vector_store._collection.count() > 0

    except Exception:
        return False


# -------------------------------------------------
# COUNT DOCUMENTS
# -------------------------------------------------
def get_document_count(
    embedding_model,
    persist_directory=DEFAULT_PERSIST_DIRECTORY,
    collection_name=DEFAULT_COLLECTION_NAME,
):
    """
    Return number of stored chunks.
    """

    vector_store = load_vector_store(
        embedding_model,
        persist_directory,
        collection_name,
    )

    return vector_store._collection.count()


# -------------------------------------------------
# RESET VECTOR STORE
# -------------------------------------------------
def reset_vector_store(persist_directory=DEFAULT_PERSIST_DIRECTORY):
    """
    Delete entire vector DB.
    """

    persist_path = Path(persist_directory)

    if persist_path.exists():
        shutil.rmtree(persist_path)
        print(f"Deleted vector store: {persist_path}")


# -------------------------------------------------
# PERSIST PATH PER PAPER
# -------------------------------------------------
def get_paper_persist_directory(pdf_url: str):
    """
    Generate unique storage path for a paper.
    """

    paper_id = hashlib.md5(pdf_url.encode("utf-8")).hexdigest()

    return f"{CHROMA_DIR}/{paper_id}"

# -------------------------------------------------
# STABLE CHUNK ID
# -------------------------------------------------
def _stable_chunk_id(chunk):
    """
    Generate deterministic chunk ID for deduplication.
    """

    metadata = chunk.metadata or {}

    source = metadata.get("source", "")
    page = metadata.get("page", "")
    chunk_index = metadata.get("chunk_index", "")

    content = " ".join((chunk.page_content or "").split())

    raw_id = "|".join([
        str(source),
        str(page),
        str(chunk_index),
        content,
    ])
# -------------------------------------------------
# PAPER UNDERSTANDING
# -------------------------------------------------

def save_paper_understanding(
    pdf_url: str,
    paper_understanding: dict
):
    persist_dir = Path(get_paper_persist_directory(pdf_url))
    persist_dir.mkdir(parents=True,exist_ok=True)
    file_path = (persist_dir /"paper_understanding.json")
    with open(
        file_path,
        "w",
        encoding="utf-8"
    ) as f:
        json.dump(
            paper_understanding,
            f,
            indent=2,
            ensure_ascii=False
        )

def load_paper_understanding(
    pdf_url: str
):
    file_path = (Path(get_paper_persist_directory(pdf_url))
        / "paper_understanding.json"
    )

    if not file_path.exists():
        return None

    with open(
        file_path,
        "r",
        encoding="utf-8"
    ) as f:
        return json.load(f)

    return hashlib.sha256(raw_id.encode("utf-8")).hexdigest()