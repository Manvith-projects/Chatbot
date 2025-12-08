import os
from dotenv import load_dotenv
from pymongo import MongoClient
from sentence_transformers import SentenceTransformer

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("DB_NAME", "sv_royal")

KB_PATH = os.path.join("kb", "svroyal_kb.md")

model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

client = MongoClient(MONGODB_URI)
db = client[DB_NAME]
kb_collection = db["kb_chunks"]


def load_kb():
    with open(KB_PATH, "r", encoding="utf-8") as f:
        return f.read()


def chunk_text(text: str, max_chars: int = 800):
    """
    Smarter chunker:
    - splits by lines
    - starts new chunks at markdown headings (#, ##, ###)
    - enforces max_chars limit
    """
    lines = text.splitlines()
    chunks = []
    current = ""

    def add_chunk(c):
        c = c.strip()
        if c:
            chunks.append(c)

    for line in lines:
        stripped = line.rstrip()

        # If this is a heading, start a new chunk
        if stripped.startswith("#"):
            if current:
                add_chunk(current)
                current = ""
            current = stripped + "\n"
            continue

        # Normal line
        if len(current) + len(stripped) + 1 <= max_chars:
            current += stripped + "\n"
        else:
            add_chunk(current)
            current = stripped + "\n"

    if current:
        add_chunk(current)

    # Hard-split any remaining large chunks
    final_chunks = []
    for c in chunks:
        if len(c) <= max_chars:
            final_chunks.append(c)
        else:
            for i in range(0, len(c), max_chars):
                final_chunks.append(c[i:i+max_chars])

    return final_chunks


def main():
    text = load_kb()
    chunks = chunk_text(text, max_chars=800)

    print(f"Total chunks created: {len(chunks)}")
    for i, c in enumerate(chunks[:5]):
        print(f"\n--- Chunk {i} (len={len(c)}) ---\n{c[:200]}...")

    # Clear old
    kb_collection.delete_many({})

    docs = []
    for i, chunk in enumerate(chunks):
        emb = model.encode(chunk).tolist()
        doc = {
            "source": "svroyal_kb.md",
            "chunk_index": i,
            "text": chunk,
            "embedding": emb
        }
        docs.append(doc)

    if docs:
        kb_collection.insert_many(docs)

    print("✅ Reindexed KB with multiple chunks.")


if __name__ == "__main__":
    main()
