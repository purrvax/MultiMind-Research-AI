from langchain_huggingface import HuggingFaceEndpointEmbeddings
import os

def get_embedding_model():
    embedding_model = HuggingFaceEndpointEmbeddings(
        model="BAAI/bge-small-en-v1.5",
        huggingfacehub_api_token=os.getenv(
            "HUGGINGFACEHUB_API_TOKEN"
        )
    )
    return embedding_model