import os
from dotenv import load_dotenv
from pymongo import MongoClient
from sentence_transformers import SentenceTransformer
import google.generativeai as genai

# Load .env file from the same directory as this script
env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
load_dotenv(dotenv_path=env_path)

MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("DB_NAME", "sv_royal")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

genai.configure(api_key=GEMINI_API_KEY)

client = MongoClient(MONGODB_URI)
db = client[DB_NAME]
kb_collection = db["kb_chunks"]

# HuggingFace embedding model (same as in build_index.py)
embedder = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

def embed_query(text: str):
    return embedder.encode(text).tolist()

def retrieve_context(question: str, k: int = 5):
    q_emb = embed_query(question)

    pipeline = [
        {
            "$vectorSearch": {
                "index": "kb_index",   # name you gave in Atlas
                "path": "embedding",
                "queryVector": q_emb,
                "numCandidates": 100,
                "limit": k
            }
        },
        {
            "$project": {
                "_id": 0,
                "text": 1,
                "source": 1,
                "chunk_index": 1,
                "score": {"$meta": "vectorSearchScore"}
            }
        }
    ]

    results = list(kb_collection.aggregate(pipeline))
    return results

def build_prompt(question: str, contexts: list[dict]) -> str:
    ctx = "\n\n---\n\n".join(c["text"] for c in contexts)

    prompt = f"""
You are SV Royal Hotel's official assistant.
You must answer ONLY using the hotel information in the Context.
If the answer is not clearly present, say you are not sure and suggest contacting the hotel.

Hotel contact:
Phone: +91 9563 776 776
Email: svroyalguntur@gmail.com

User Question:
{question}

Context:
{ctx}

Now answer in a friendly and clear way:
"""
    return prompt

def generate_answer(question: str):
    docs = retrieve_context(question, k=5)
    prompt = build_prompt(question, docs)

    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content(prompt)
    answer = response.text

    return answer, docs
