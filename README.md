# MultiMind Research AI

MultiMind Research AI is a full-stack research assistant that helps users discover academic papers, build a workspace around them, and generate AI-powered insights such as summaries, notes, flashcards, and Q&A. The platform combines a React frontend with a FastAPI backend and retrieval-augmented generation (RAG) workflows for paper understanding.

## Overview

This project is designed for researchers, students, and professionals who want to:

- Search and browse academic papers
- Create a personalized workspace for selected papers
- Generate summaries and structured research outputs
- Ask questions about a paper using AI-powered retrieval
- Create flashcards and notes from research content

## Key Features

- User authentication and session handling
- Paper search and paper history tracking
- Workspace creation around a selected paper
- AI-generated paper summaries
- Note generation from research content
- Flashcard generation for study support
- Q&A chat over paper content
- Vector-based retrieval and hybrid retrieval support

## Tech Stack

### Frontend
- React
- Vite
- React Router
- CSS / component-based UI

### Backend
- Python
- FastAPI
- SQLAlchemy
- MySQL
- JWT authentication
- LangChain-based RAG pipeline

### AI / Retrieval
- LangChain
- Chroma vector store
- Hugging Face embeddings
- BM25 / hybrid retrieval
- Groq-based LLM integration

## File Structure

```text
MultiMind-Research-AI/
├── backend/
│   ├── ai/
│   │   ├── chunker.py
│   │   ├── document_search.py
│   │   ├── embeddings.py
│   │   ├── pdf_loader.py
│   │   ├── text_cleaner.py
│   │   ├── vector_store.py
│   │   └── rerankers/
│   ├── apis/
│   │   ├── analyze.py
│   │   ├── auth.py
│   │   ├── flashcards.py
│   │   ├── notes.py
│   │   ├── papers.py
│   │   ├── QnA.py
│   │   └── summary.py
│   ├── data/
│   ├── DocStore/
│   ├── llm/
│   ├── prompts/
│   ├── rag/
│   ├── services/
│   ├── uploads/
│   ├── cancel_manager.py
│   ├── database.py
│   └── main.py
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── tests/
├── package.json
├── package-lock.json
├── requirements.txt
└── README.md
```

## Prerequisites

Before running the project, make sure you have:

- Python 3.10+ installed
- Node.js and npm installed
- MySQL running locally or remotely
- Environment variables configured for backend services

## Environment Variables

Create a `.env` file in the project root (or backend directory depending on your setup) with variables similar to:

```env
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=multimind_research_ai
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
SEMANTIC_SCHOLAR_API_KEY=your_semantic_scholar_key
```

> Note: Some values may already be configured in your local environment. Adjust them to match your setup.

## Backend Setup

1. Navigate to the project root.
2. Create and activate a virtual environment:

```bash
python -m venv venv
source venv/bin/activate
```

On Windows:

```bash
venv\Scripts\activate
```

3. Install Python dependencies:

```bash
pip install -r requirements.txt
```

4. Start the FastAPI server:

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Frontend Setup

1. Install frontend dependencies:

```bash
cd frontend
npm install
```

2. Start the development server:

```bash
npm run dev
```

The frontend is typically served at:

- http://localhost:5173

The backend API runs at:

- http://localhost:8000

## Running the Application

Once both services are running:

1. Open the frontend in your browser.
2. Register or log in.
3. Search for a paper and open it in your workspace.
4. Use the available tools to generate summaries, notes, flashcards, and answers.

## Database Notes

The backend uses SQLAlchemy models for:

- users
- papers
- user-paper history
- chat messages
- generated assets

A MySQL database is expected, and the schemas should be created before the app is used fully.

## Usage Flow

1. Sign in to the application.
2. Search for an academic paper.
3. Open the paper in the workspace.
4. Generate or view:
   - summary
   - notes
   - flashcards
   - Q&A responses

## Development Notes

The project is organized around a modular backend architecture where:

- API routes are separated under the apis directory
- AI and retrieval logic lives under the ai directory
- RAG functionality is isolated under the rag directory
- Frontend pages are split by feature for easier maintenance

## License

This project is intended for educational and research use. Please check the repository license before commercial use.

## Contributing

Contributions are welcome. If you’d like to improve the project:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request
