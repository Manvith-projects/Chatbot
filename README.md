# 🏨 SV Royal Hotel Chatbot

An AI-powered conversational chatbot for SV Royal Hotel that provides instant answers about hotel amenities, services, nearby attractions, and booking information using RAG (Retrieval-Augmented Generation) technology.

![Python](https://img.shields.io/badge/Python-3.11-blue)
![React](https://img.shields.io/badge/React-18.2-61dafb)
![Flask](https://img.shields.io/badge/Flask-3.1-black)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![Gemini](https://img.shields.io/badge/Gemini-1.5--Flash-orange)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [System Flow](#system-flow)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)

---

## 🎯 Overview

This chatbot is designed specifically for SV Royal Hotel in Guntur, Andhra Pradesh. It helps guests and potential customers by:

- Answering questions about hotel facilities, rooms, and amenities
- Providing information about nearby tourist attractions
- Offering directions with interactive Google Maps integration
- Collecting user feedback to improve responses
- Maintaining conversation context for personalized interactions

The system uses **Retrieval-Augmented Generation (RAG)** to ensure accurate, contextual responses based on the hotel's knowledge base.

---

## ✨ Features

### 🤖 **AI-Powered Responses**
- Context-aware answers using Google's Gemini 1.5 Flash
- Vector similarity search for relevant information retrieval
- Real-time response generation

### 📍 **Location & Maps Integration**
- Interactive Google Maps links for tourist attractions
- Direct navigation to nearby places
- Distance information from hotel

### 📊 **Smart Feedback System**
- Dynamic feedback questions based on user interaction history
- Rating collection (thumbs up/down)
- Detailed feedback capture for continuous improvement

### 💬 **Modern Chat Interface**
- Real-time message streaming
- Typing indicators
- Markdown support for formatted responses
- Responsive design for mobile and desktop
- Suggested questions and quick intents for one-tap queries

### 🚀 **Growth & Booking Accelerators (Free)**
- One-click CTAs: call, WhatsApp, email booking, directions, talk-to-human
- Quick intents for rates/offers, family/weekend/business packages, corporate/long-stay deals
- Free mailto flows: waitlist requests, reviews, referrals, group/event quotes
- Lead capture (name/email/phone) with consent note; drafts email locally (no server storage)
- Upsell prompts: airport pickup, late checkout/add-ons asked via intents

### 🧳 **Concierge & Local Discovery**
- Quick intents for cabs/tours/itinerary, restaurant/spa slot help, housekeeping/amenities
- Live map links to hotel and nearby attractions with Google Maps search URLs

### 🛡️ **Trust & Compliance (Lightweight)**
- Client-side-only lead drafts (mailto) to avoid storing PII on server
- Explicit consent note near lead capture
- Optional human handoff via call/WhatsApp/email

### 🔒 **Session Management**
- User tracking for personalized experiences
- Feedback history and analytics
- Average satisfaction scoring

---

## 🛠️ Tech Stack

### **Backend**
| Technology | Purpose |
|------------|---------|
| ![Python](https://img.shields.io/badge/-Python-3776AB?logo=python&logoColor=white) **Python 3.11** | Core backend language |
| ![Flask](https://img.shields.io/badge/-Flask-000000?logo=flask&logoColor=white) **Flask** | Web framework and REST API |
| ![MongoDB](https://img.shields.io/badge/-MongoDB-47A248?logo=mongodb&logoColor=white) **MongoDB Atlas** | Vector database for embeddings & feedback |
| **Sentence Transformers** | Text embeddings (all-MiniLM-L6-v2) |
| **Google Gemini AI** | LLM for response generation |
| **PyMongo** | MongoDB driver |
| **Flask-CORS** | Cross-origin resource sharing |

### **Frontend**
| Technology | Purpose |
|------------|---------|
| ![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=black) **React 18** | UI framework |
| ![Vite](https://img.shields.io/badge/-Vite-646CFF?logo=vite&logoColor=white) **Vite** | Build tool and dev server |
| **Axios** | HTTP client for API calls |
| **React Markdown** | Markdown rendering in chat |
| **CSS3** | Custom styling with gradients |

### **Infrastructure**
- **MongoDB Atlas** - Cloud database
- **Render/Vercel** - Deployment platforms
- **Google Maps API** - Location services
- **Gunicorn** - WSGI HTTP server
- CPU-only PyTorch (`torch==2.9.1+cpu` via extra index) to avoid heavy GPU wheels and keep builds lean.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                         │
│                    (React Frontend)                          │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ HTTP/REST
                 │
┌────────────────▼────────────────────────────────────────────┐
│                      Flask Backend                           │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   API       │  │  RAG Engine  │  │  Feedback    │       │
│  │  Endpoints  │  │              │  │  Manager     │       │
│  └─────────────┘  └──────────────┘  └──────────────┘       │
└────────┬───────────────────┬──────────────────┬─────────────┘
         │                   │                  │
         │                   │                  │
    ┌────▼─────┐      ┌─────▼──────┐    ┌─────▼──────┐
    │ MongoDB  │      │  Sentence  │    │   Gemini   │
    │  Atlas   │      │Transformers│    │  1.5 Flash │
    │(Vectors) │      │ (Embedder) │    │    (LLM)   │
    └──────────┘      └────────────┘    └────────────┘
```

---

## 🔄 System Flow

### **1. Indexing Phase (Build Knowledge Base)**

```
Knowledge Base (Markdown)
         │
         ▼
   Chunk Text (800 chars)
         │
         ▼
  Generate Embeddings
  (Sentence Transformer)
         │
         ▼
  Store in MongoDB
  (Vector Database)
```

### **2. Query Processing Flow**

```
User Question
     │
     ▼
Generate Query Embedding
     │
     ▼
Vector Search in MongoDB
(Find top 5 similar chunks)
     │
     ▼
Build Context Prompt
     │
     ▼
Send to Gemini AI
     │
     ▼
Generate Answer
     │
     ▼
Detect Locations
     │
     ▼
Return Response + Map Links
     │
     ▼
Display in Chat UI
```

### **3. Feedback Loop**

```
User Rates Answer
     │
     ▼
Store Feedback in MongoDB
     │
     ▼
Update User Statistics
     │
     ▼
Adjust Future Questions
(Dynamic feedback strategy)
```

---

## 📁 Project Structure

```
SV Royal/
│
├── app.py                      # Flask backend main file
├── rag_utils.py                # RAG implementation & Gemini integration
├── build_index.py              # Knowledge base indexing script
├── requirements.txt            # Python dependencies
├── Procfile                    # Deployment configuration
├── runtime.txt                 # Python version specification
├── .env                        # Environment variables (not in git)
├── .gitignore                  # Git ignore rules
│
├── KB/
│   └── svroyal_kb.md          # Hotel knowledge base (markdown)
│
├── frontend/
│   ├── package.json           # Node dependencies
│   ├── vite.config.js         # Vite configuration
│   ├── index.html             # HTML entry point
│   │
│   ├── src/
│   │   ├── main.jsx           # React entry point
│   │   ├── App.jsx            # Main chat component
│   │   ├── App.css            # Component styles
│   │   └── index.css          # Global styles
│   │
│   └── dist/                  # Production build (generated)
│
├── DEPLOYMENT.md              # Comprehensive deployment guide
├── QUICK_START.md             # Quick deployment steps
└── README.md                  # This file
```

---

## 🚀 Installation

### **Prerequisites**

- Python 3.11+
- Node.js 18+
- MongoDB Atlas account
- Google Gemini API key

### **Backend Setup**

1. **Clone the repository**
   ```bash
   git clone https://github.com/Manvith-projects/Chatbot.git
   cd Chatbot
   ```

2. **Create virtual environment**
   ```bash
   python -m venv rag-sv
   .\rag-sv\Scripts\activate  # Windows
   source rag-sv/bin/activate  # Linux/Mac
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   
   Create `.env` file:
   ```env
   MONGODB_URI=your_mongodb_atlas_connection_string
   DB_NAME=sv_royal
   GEMINI_API_KEY=your_gemini_api_key
   ```

5. **Build knowledge base index**
   ```bash
   python build_index.py
   ```

6. **Run backend server**
   ```bash
   python app.py
   ```
   Backend runs at: `http://localhost:5000`

### **Frontend Setup**

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   Frontend runs at: `http://localhost:3000`

---

## 💻 Usage

### **For Development**

1. Start backend: `python app.py`
2. Start frontend: `cd frontend && npm run dev`
3. Open browser: `http://localhost:3000`

### **Update Knowledge Base**

1. Edit `KB/svroyal_kb.md`
2. Run: `python build_index.py`
3. Restart backend

### **Test API Endpoints**

**Ask a Question:**
```bash
curl -X POST http://localhost:5000/ask \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What are your room rates?",
    "user_id": "test_user_123"
  }'
```

**Submit Feedback:**
```bash
curl -X POST http://localhost:5000/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user_123",
    "question": "What are your room rates?",
    "answer": "Our rooms start from...",
    "rating": 5,
    "feedback_text": "Very helpful!",
    "feedback_type": "csat_short"
  }'
```

---

## 🌐 Deployment

### **Quick Deploy to Render (Recommended)**

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy SV Royal Chatbot"
   git push origin main
   ```

2. **Deploy Backend**
   - Go to [render.com](https://render.com)
   - Create Web Service from GitHub repo
   - Build: `pip install -r requirements.txt`
   - Start: `gunicorn app:app --bind 0.0.0.0:${PORT:-8000}`
   - Add environment variables

3. **Deploy Frontend**
   - Create Static Site on Render
   - Build: `cd frontend && npm run build`
   - Publish: `frontend/dist`

📖 **Detailed deployment guide:** [DEPLOYMENT.md](DEPLOYMENT.md)

📋 **Quick start guide:** [QUICK_START.md](QUICK_START.md)

---

## 📚 API Documentation

### **POST /ask**

Request a chatbot response.

**Request:**
```json
{
  "question": "What amenities do you offer?",
  "user_id": "user_12345"
}
```

**Response:**
```json
{
  "answer": "We offer swimming pool, gym, restaurant...",
  "feedback_question": {
    "text": "Was this answer helpful?",
    "type": "csat_short"
  },
  "contexts": [...]
}
```

### **POST /feedback**

Submit user feedback.

**Request:**
```json
{
  "user_id": "user_12345",
  "question": "What amenities do you offer?",
  "answer": "We offer...",
  "rating": 5,
  "feedback_text": "Great response!",
  "feedback_type": "csat_short"
}
```

**Response:**
```json
{
  "status": "ok"
}
```

---

## 🧪 Key Technologies Explained

### **RAG (Retrieval-Augmented Generation)**
Combines information retrieval with AI generation:
1. **Retrieval**: Find relevant chunks from knowledge base
2. **Augmentation**: Add context to the prompt
3. **Generation**: AI generates accurate, contextual response

### **Vector Search**
- Text converted to embeddings (768-dimensional vectors)
- MongoDB Atlas vector search finds similar content
- Cosine similarity measures relevance

### **Sentence Transformers**
- Model: `all-MiniLM-L6-v2`
- Converts text to meaningful embeddings
- Trained on semantic similarity tasks

### **Google Gemini 1.5 Flash**
- Fast, efficient LLM
- Context window: 1M tokens
- Multimodal capabilities

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

This project is proprietary software for SV Royal Hotel.

---

## 📞 Contact

**SV Royal Hotel**
- 📧 Email: svroyalguntur@gmail.com
- 📱 Phone: +91 9563 776 776
- 📍 Location: Guntur, Andhra Pradesh

**Developer**
- GitHub: [@Manvith-projects](https://github.com/Manvith-projects)

---

## 🙏 Acknowledgments

- Google Gemini AI for LLM capabilities
- Hugging Face for Sentence Transformers
- MongoDB Atlas for vector database
- React community for excellent documentation

---

## 📊 Future Enhancements

- [ ] Multi-language support (Telugu, Hindi)
- [ ] Voice input/output
- [ ] Booking integration
- [ ] Live chat with staff
- [ ] Image recognition for room queries
- [ ] WhatsApp/Telegram bot integration
- [ ] Analytics dashboard
- [ ] A/B testing for responses

---

<div align="center">

**Made with ❤️ for SV Royal Hotel**

⭐ Star this repo if you find it helpful!

</div>
