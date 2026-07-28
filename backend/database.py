import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, String, BigInteger, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    MYSQL_HOST = os.getenv("MYSQL_HOST", "127.0.0.1")
    MYSQL_PORT = os.getenv("MYSQL_PORT", "3306")
    MYSQL_USER = os.getenv("MYSQL_USER", "root")
    MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD")
    MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "multimind_research_ai")

    if not MYSQL_PASSWORD:
        raise RuntimeError("MYSQL_PASSWORD environment variable is required when DATABASE_URL is not set")

# Construct connection URL
    DATABASE_URL = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}"

# Create engine
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """FastAPI Dependency for database sessions"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =========================================================================
# DATABASE MODELS
# =========================================================================

class User(Base):
    __tablename__ = "users"
    
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False)
    name = Column(String(255), nullable=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(String(64), nullable=False)
    updated_at = Column(String(64), nullable=False)

class Paper(Base):
    __tablename__ = "papers"
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    paper_url = Column(String(1024), unique=True, nullable=False)
    paper_hash = Column(String(32), unique=True, nullable=False)
    title = Column(Text, nullable=True)
    authors = Column(Text, nullable=True)
    abstract = Column(Text, nullable=True)
    published_date = Column(String(64), nullable=True)
    source = Column(String(255), nullable=True)
    vector_store_path = Column(String(1024), nullable=True)
    paper_understanding_path = Column(String(1024), nullable=True)
    processing_status = Column(String(32), nullable=False, default="pending")
    created_at = Column(String(64), nullable=False)
    updated_at = Column(String(64), nullable=False)

class UserPaper(Base):
    __tablename__ = "user_papers"
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, nullable=False)
    paper_id = Column(BigInteger, nullable=False)
    last_opened_at = Column(String(64), nullable=True)
    created_at = Column(String(64), nullable=False)
    updated_at = Column(String(64), nullable=False)

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, nullable=False)
    paper_id = Column(BigInteger, nullable=False)
    role = Column(String(32), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(String(64), nullable=False)

class GeneratedAsset(Base):
    __tablename__ = "generated_assets"
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, nullable=False)
    paper_id = Column(BigInteger, nullable=False)
    asset_type = Column(String(64), nullable=False)
    params_json = Column(String(512), nullable=False, default="{}")
    content_json = Column(Text, nullable=False)
    created_at = Column(String(64), nullable=False)
    updated_at = Column(String(64), nullable=False)
