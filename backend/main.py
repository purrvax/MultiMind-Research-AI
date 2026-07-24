from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from apis import papers
from apis import analyze
from apis import flashcards
from apis import QnA
from apis import summary
from apis import notes
from apis import auth
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(
    auth.router,
    prefix="/api"
)
app.include_router(
    papers.router,
    prefix="/api"
)
app.include_router(
    analyze.router,
    prefix="/api"
)
app.include_router(
    flashcards.router,
    prefix="/api"
)
app.include_router(
    papers.router,
    prefix="/api"
)
app.include_router(
    notes.router,
    prefix="/api"
)
app.include_router(
    QnA.router,
    prefix="/api"
)
app.include_router(
    summary.router,
    prefix = "/api"
)