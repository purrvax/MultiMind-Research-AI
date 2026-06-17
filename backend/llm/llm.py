import os

from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()
def get_llm():
    try:
        groq_llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            groq_api_key=os.getenv("GROQ_API_KEY"),
            temperature=0.2,
        )
        gemini_llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=os.getenv("GEMINI_API_KEY"),
            temperature=0.2,
        )
        return groq_llm.with_fallbacks(
            [gemini_llm]
        )
    except Exception as e:
        print("LLM initialization failed:",str(e))
        return None