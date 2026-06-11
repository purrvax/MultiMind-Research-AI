from pathlib import Path
import shutil
import hashlib
from langchain_chroma import Chroma
from langchain_core.documents import Document


DEFAULT_PERSIST_DIRECTORY = "chroma_db"
DEFAULT_COLLECTION_NAME = "research_papers"


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
        raise ValueError(
            "Cannot create vector store without chunks."
        )
    persist_path = Path(persist_directory)
    persist_path.mkdir(
        parents=True,
        exist_ok=True,
    )
    vector_store = Chroma(
        embedding_function=embedding_model,
        persist_directory=str(
            persist_path
        ),
        collection_name=collection_name,
    )
    if reset_existing:
        try:
            vector_store._client.delete_collection(
                collection_name
            )
        except Exception:
            pass
        vector_store = Chroma(
            embedding_function=embedding_model,
            persist_directory=str(
                persist_path
            ),
            collection_name=collection_name,
        )
    add_documents(
        vector_store=vector_store,
        chunks=chunks,
    )
    return vector_store

def load_vector_store(
    embedding_model,
    persist_directory=DEFAULT_PERSIST_DIRECTORY,
    collection_name=DEFAULT_COLLECTION_NAME,
):
    """
    Load existing Chroma vector store.
    """
    persist_path = Path(
        persist_directory
    )
    if not persist_path.exists():

        raise FileNotFoundError(
            f"Vector store not found: "
            f"{persist_path}"
        )

    return Chroma(
        embedding_function=embedding_model,
        persist_directory=str(
            persist_path
        ),
        collection_name=collection_name,
    )

def add_documents(
    vector_store,
    chunks,
):
    """
    Add documents while skipping duplicates.
    """
    if not chunks:
        return
    chunk_ids = [
        _stable_chunk_id(chunk)
        for chunk in chunks
    ]
    existing_ids = set()
    try:
        existing = (
            vector_store
            ._collection
            .get(
                ids=chunk_ids,
                include=[],
            )
        )
        existing_ids = set(
            existing.get(
                "ids",
                []
            )
        )
    except Exception:
        existing_ids = set()

    new_chunks = []
    new_ids = []

    for chunk, chunk_id in zip(
        chunks,
        chunk_ids,
    ):
        if chunk_id in existing_ids:
            continue
        new_chunks.append(
            chunk
        )
        new_ids.append(
            chunk_id
        )
    if not new_chunks:
        return
    vector_store.add_documents(
        documents=new_chunks,
        ids=new_ids,
    )

def get_all_documents(
    embedding_model,
    persist_directory=DEFAULT_PERSIST_DIRECTORY,
    collection_name=DEFAULT_COLLECTION_NAME,
):
    """
    Load all documents from Chroma.
    Useful for BM25 retriever.
    """

    vector_store = load_vector_store(
        embedding_model=embedding_model,
        persist_directory=persist_directory,
        collection_name=collection_name,
    )

    results = (
        vector_store
        ._collection
        .get(
            include=[
                "documents",
                "metadatas",
            ]
        )
    )
    documents = []
    docs = results.get(
        "documents",
        []
    )
    metadatas = results.get(
        "metadatas",
        []
    )
    for content, metadata in zip(
        docs,
        metadatas,
    ):
        documents.append(
            Document(
                page_content=content or "",
                metadata=metadata or {},
            )
        )
    return documents

def vector_store_has_documents(
    embedding_model,
    persist_directory=DEFAULT_PERSIST_DIRECTORY,
    collection_name=DEFAULT_COLLECTION_NAME,
):
    """
    Check whether a vector store exists
    and contains at least one document.
    """
    try:
        vector_store = (
            load_vector_store(
                embedding_model=embedding_model,
                persist_directory=persist_directory,
                collection_name=collection_name,
            )
        )
        return (
            vector_store
            ._collection
            .count()
            > 0
        )
    except Exception:
        return False

def get_document_count(
    embedding_model,
    persist_directory=DEFAULT_PERSIST_DIRECTORY,
    collection_name=DEFAULT_COLLECTION_NAME,
):
    """
    Return number of stored chunks.
    """

    vector_store = load_vector_store(
        embedding_model=embedding_model,
        persist_directory=persist_directory,
        collection_name=collection_name,
    )

    return (
        vector_store
        ._collection
        .count()
    )

def reset_vector_store(
    persist_directory=DEFAULT_PERSIST_DIRECTORY,
):
    """
    Delete an entire Chroma database.
    """

    persist_path = Path(
        persist_directory
    )

    if persist_path.exists():

        shutil.rmtree(
            persist_path
        )

        print(
            f"Deleted vector store: "
            f"{persist_path}"
        )

def get_paper_persist_directory(
    pdf_url: str,
):
    """
    Generate unique storage path
    for a paper.
    """

    paper_id = hashlib.md5(
        pdf_url.encode(
            "utf-8"
        )
    ).hexdigest()

    return (
        f"data/vectorstores/{paper_id}"
    )

def _stable_chunk_id(
    chunk,
):
    """
    Generate deterministic chunk ID.
    """

    metadata = (
        chunk.metadata
        or {}
    )

    source = metadata.get(
        "source",
        ""
    )

    page = metadata.get(
        "page",
        ""
    )

    chunk_index = metadata.get(
        "chunk_index",
        ""
    )

    content = " ".join(
        (
            chunk.page_content
            or ""
        ).split()
    )

    raw_id = "|".join(
        [
            str(source),
            str(page),
            str(chunk_index),
            content,
        ]
    )

    return hashlib.sha256(
        raw_id.encode(
            "utf-8"
        )
    ).hexdigest()