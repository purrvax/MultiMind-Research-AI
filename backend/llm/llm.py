import os

from dotenv import load_dotenv

from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()


def get_llm():

    groq_llm_1 = ChatGroq(
        model="llama-3.3-70b-versatile",
        groq_api_key=os.getenv(
            "GROQ_API_KEY1"
        ),
        temperature=0.2,
    )

    groq_llm_2 = ChatGroq(
        model="llama-3.3-70b-versatile",
        groq_api_key=os.getenv(
            "GROQ_API_KEY2"
        ),
        temperature=0.2,
    )

    groq_llm_3 = ChatGroq(
        model="llama-3.3-70b-versatile",
        groq_api_key=os.getenv(
            "GROQ_API_KEY3"
        ),
        temperature=0.2,
    )

    gemini_llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=os.getenv(
            "GEMINI_API_KEY"
        ),
        temperature=0.2,
    )

    return groq_llm_1.with_fallbacks(
        [
            groq_llm_2,
            groq_llm_3,
            gemini_llm
        ]
    )