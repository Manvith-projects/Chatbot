from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from dotenv import load_dotenv
from pymongo import MongoClient
from bson import ObjectId
import os
import random
from typing import Optional, Dict, Any

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
bookings_col = db["bookings"]

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


def serialize_booking(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Convert Mongo _id to string for JSON responses."""
    doc = dict(doc)
    doc["booking_id"] = str(doc.pop("_id"))
    return doc


def validate_booking_payload(payload: Dict[str, Any]) -> Optional[str]:
    required = ["guest_name", "phone", "check_in", "check_out", "guests"]
    missing = [f for f in required if not payload.get(f)]
    if missing:
        return f"Missing fields: {', '.join(missing)}"
    return None

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


@app.route("/bookings", methods=["POST"])
def create_booking():
    payload = request.get_json(force=True)
    error = validate_booking_payload(payload)
    if error:
        return jsonify({"error": error}), 400

    booking = {
        "guest_name": payload.get("guest_name"),
        "email": payload.get("email"),
        "phone": payload.get("phone"),
        "check_in": payload.get("check_in"),
        "check_out": payload.get("check_out"),
        "guests": int(payload.get("guests", 1)),
        "room_type": payload.get("room_type"),
        "notes": payload.get("notes"),
        "source": payload.get("source", "chatbot"),
        "status": "pending",
        "created_at": datetime.utcnow(),
    }

    result = bookings_col.insert_one(booking)
    booking["_id"] = result.inserted_id

    return jsonify({"booking": serialize_booking(booking)}), 201


@app.route("/bookings", methods=["GET"])
def list_bookings():
    status = request.args.get("status")
    query = {"status": status} if status else {}
    bookings = [serialize_booking(b) for b in bookings_col.find(query).sort("created_at", -1)]
    return jsonify({"bookings": bookings})


@app.route("/bookings/<booking_id>", methods=["PATCH"])
def update_booking(booking_id):
    data = request.get_json(force=True)
    allowed = {"status", "notes", "room_type", "guests", "check_in", "check_out"}
    updates = {k: v for k, v in data.items() if k in allowed}

    if not updates:
        return jsonify({"error": "No valid fields to update"}), 400

    try:
        oid = ObjectId(booking_id)
    except Exception:
        return jsonify({"error": "Invalid booking id"}), 400

    result = bookings_col.update_one({"_id": oid}, {"$set": updates})
    if result.matched_count == 0:
        return jsonify({"error": "Booking not found"}), 404

    doc = bookings_col.find_one({"_id": oid})
    return jsonify({"booking": serialize_booking(doc)})


@app.route("/analytics", methods=["GET"])
def analytics():
    total_feedback = feedback_col.count_documents({})
    total_users = user_stats_col.count_documents({})
    total_bookings = bookings_col.count_documents({})

    avg_rating_doc = user_stats_col.aggregate([
        {"$group": {"_id": None, "avg": {"$avg": "$avg_rating"}}}
    ])
    avg_rating = None
    for item in avg_rating_doc:
        avg_rating = item.get("avg")

    recent_feedback = list(
        feedback_col.find({}, {"question": 1, "rating": 1, "created_at": 1})
        .sort("created_at", -1)
        .limit(5)
    )
    for fb in recent_feedback:
        fb["id"] = str(fb.pop("_id"))

    booking_status_counts = list(
        bookings_col.aggregate([
            {"$group": {"_id": "$status", "count": {"$sum": 1}}}
        ])
    )

    status_counts = {item["_id"]: item["count"] for item in booking_status_counts}

    return jsonify({
        "totals": {
            "feedback": total_feedback,
            "users": total_users,
            "bookings": total_bookings,
            "avg_rating": avg_rating
        },
        "recent_feedback": recent_feedback,
        "booking_status": status_counts
    })


if __name__ == "__main__":
    app.run(debug=True)
