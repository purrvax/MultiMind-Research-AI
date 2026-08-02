import os

# Root storage directory, defaults to ./storage for local dev
BASE_STORAGE = os.getenv("BASE_STORAGE", "./storage")

# Subdirectories for organized persistence
UPLOADS_DIR = f"{BASE_STORAGE}/uploads"
CHROMA_DIR = f"{BASE_STORAGE}/chroma"
DATA_DIR = f"{BASE_STORAGE}/data"
DOCSTORE_DIR = f"{BASE_STORAGE}/docstore"

# Ensure all storage directories exist on startup
for path in [UPLOADS_DIR, CHROMA_DIR, DATA_DIR, DOCSTORE_DIR]:
    os.makedirs(path, exist_ok=True)
