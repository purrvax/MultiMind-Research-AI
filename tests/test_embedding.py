from dotenv import load_dotenv
load_dotenv()

from backend.ai.embeddings import get_embedding_model
from huggingface_hub import whoami
import os

print(
    whoami(
        token=os.getenv("HUGGINGFACEHUB_API_TOKEN")
    )
)
def test_embedding():

    print("Loading embedding model...")

    embedding = get_embedding_model()

    print("Generating embedding...")

    vector = embedding.embed_query(
        "What is a transformer model?"
    )

    print("Embedding generated successfully")
    print("Vector dimension:", len(vector))
    print("First 5 values:", vector[:5])


if __name__ == "__main__":
    test_embedding()