from langchain_huggingface import HuggingFaceEmbeddings
def get_embedding_model():
    embeddings = HuggingFaceEmbeddings(
        model_name="BAAI/bge-base-en-v1.5",
        encode_kwargs={
            "normalize_embeddings": True
        }
    )
    return embeddings
