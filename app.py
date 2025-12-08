from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from dotenv import load_dotenv
from pymongo import MongoClient
import os
import random

# Load .env file from the same directory as this script
env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
load_dotenv(dotenv_path=env_path)

from rag_utils import generate_answer

MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("DB_NAME", "sv_royal")

mongo_client = MongoClient(MONGODB_URI)
db = mongo_client[DB_NAME]
feedback_col = db["feedback"]
user_stats_col = db["user_stats"]

app = Flask(__name__)
CORS(app)

# Feedback question templates
FEEDBACK_TEMPLATES = {
    "csat_short": [
        "Was this answer helpful?",
        "Did this answer solve your question?",
        "How satisfied are you with this answer?"
    ],
    "clarity": [
        "Was anything confusing in this answer?",
        "What should we explain more clearly?"
    ],
    "depth": [
        "Was the answer too short, too long, or just right?",
        "Do you want more detail, or is this enough?"
    ],
    "recommendation": [
        "Would you recommend SV Royal to a friend based on this information?",
        "Does this information make you more likely to stay with us?"
    ]
}

def get_user_stats(user_id: str):
    if not user_id:
        return None
    return user_stats_col.find_one({"user_id": user_id})

def update_user_stats(user_id: str, rating: int):
    if not user_id:
        return
    stats = get_user_stats(user_id)
    if not stats:
        user_stats_col.insert_one({
            "user_id": user_id,
            "total_questions": 1,
            "total_rating": rating,
            "avg_rating": float(rating)
        })
    else:
        total_q = stats.get("total_questions", 0) + 1
        total_r = stats.get("total_rating", 0) + rating
        avg = total_r / total_q
        user_stats_col.update_one(
            {"user_id": user_id},
            {"$set": {
                "total_questions": total_q,
                "total_rating": total_r,
                "avg_rating": avg
            }}
        )

def choose_feedback_question(user_id: str):
    stats = get_user_stats(user_id)

    if not stats or stats.get("total_questions", 0) < 3:
        group = "csat_short"
    elif stats.get("avg_rating", 0) < 3:
        group = random.choice(["clarity", "depth"])
    elif stats.get("avg_rating", 0) >= 4 and stats.get("total_questions", 0) >= 5:
        group = "recommendation"
    else:
        group = "csat_short"

    text = random.choice(FEEDBACK_TEMPLATES[group])
    return {"text": text, "type": group}

@app.route("/ask", methods=["POST"])
def ask():
    data = request.get_json()
    question = (data.get("question") or "").strip()
    user_id = data.get("user_id", None)

    if not question:
        return jsonify({"error": "question is required"}), 400

    answer, docs = generate_answer(question)
    feedback_question = choose_feedback_question(user_id)

    return jsonify({
        "answer": answer,
        "feedback_question": feedback_question,
        "contexts": docs  # optional: for debugging; you can remove later
    })

@app.route("/feedback", methods=["POST"])
def feedback():
    data = request.get_json()
    user_id = data.get("user_id")
    question = data.get("question")
    answer = data.get("answer")
    rating = int(data.get("rating", 0))  # e.g., 0 or 1, or 1–5
    feedback_text = data.get("feedback_text", "")
    feedback_type = data.get("feedback_type", "csat_short")

    doc = {
        "user_id": user_id,
        "question": question,
        "answer": answer,
        "rating": rating,
        "feedback_text": feedback_text,
        "feedback_type": feedback_type,
        "created_at": datetime.utcnow()
    }
    feedback_col.insert_one(doc)
    update_user_stats(user_id, rating)

    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(debug=True)
