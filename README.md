# 🏨 SV Royal Hotel Chatbot

An AI-powered conversational chatbot and booking system for SV Royal Hotel that provides instant answers about hotel amenities, services, nearby attractions, and facilitates room bookings using RAG (Retrieval-Augmented Generation) technology.

![Python](https://img.shields.io/badge/Python-3.11-blue)
![React](https://img.shields.io/badge/React-18.2-61dafb)
![Flask](https://img.shields.io/badge/Flask-3.1-black)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![Gemini](https://img.shields.io/badge/Gemini-1.5--Flash-orange)

### 🚀 [Live Demo](https://sv-royal.onrender.com/)

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
- **Facilitating direct room bookings** with instant email confirmation
- Collecting user feedback to improve responses
- Maintaining conversation context for personalized interactions

The system uses **Retrieval-Augmented Generation (RAG)** to ensure accurate, contextual responses based on the hotel's knowledge base.

---

## ✨ Features

### 🤖 **AI-Powered Responses**
- Context-aware answers using Google's Gemini 1.5 Flash
- Vector similarity search for relevant information retrieval
- Real-time response generation

### 💎 **Luxury User Interface**
- **Premium Design**: Gold & Dark Blue color scheme reflecting the hotel's luxury branding.
- **Typography**: Elegant serif fonts (Playfair Display) for headings.
- **Responsive**: Fully optimized for mobile and desktop devices.

### 📅 **Direct Booking System**
- **Integrated Booking Form**: Users can book rooms directly within the chat interface.
- **Instant Confirmation**: Automated email sent to the guest with booking details immediately upon submission.
- **Duplicate Prevention**: Smart UI prevents double-booking submissions.
- **Validation**: Real-time validation for email, phone, and required fields.

### 📊 **Admin Dashboard**
- **Overview**: Real-time metrics on total bookings, active users, and feedback.
- **Booking Management**: View, confirm, or cancel bookings.
- **Analytics**: Visual breakdown of booking statuses (Pending, Confirmed, Cancelled).
- **Feedback Monitoring**: Review recent guest feedback and ratings.

### 📍 **Location & Maps Integration**
- Interactive Google Maps links for tourist attractions
- Direct navigation to nearby places
- Distance information from hotel

### 💬 **Modern Chat Interface**
- Real-time message streaming
- Typing indicators
- Markdown support for formatted responses
- Suggested questions and quick intents for one-tap queries

### 🚀 **Growth & Lead Generation**
- **Lead Capture**: "Request a Callback" feature for users to leave contact details.
- **Upsell Prompts**: Intelligent prompts for room upgrades or additional services.
- **Quick Intents**: One-tap access to rates, offers, and packages.

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
| **SMTP** | Email service for booking confirmations |
| **PyMongo** | MongoDB driver |
| **Flask-CORS** | Cross-origin resource sharing |

### **Frontend**
| Technology | Purpose |
|------------|---------|
| ![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=black) **React 18** | UI framework |
| ![Vite](https://img.shields.io/badge/-Vite-646CFF?logo=vite&logoColor=white) **Vite** | Build tool and dev server |
| **Axios** | HTTP client for API calls |
| **React Markdown** | Markdown rendering in chat |
| **CSS3** | Custom luxury styling with variables |

### **Infrastructure**
- **MongoDB Atlas** - Cloud database
- **Render** - Deployment platform (Backend & Frontend)
- **Google Maps API** - Location services
- **Gunicorn** - WSGI HTTP server

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
│  │   API       │  │  RAG Engine  │  │  Email       │       │
│  │  Endpoints  │  │              │  │  Service     │       │
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
Return Response
     │
     ▼
Display in Chat UI
```

### **3. Booking Flow**

```
User Submits Booking Form
     │
     ▼
Validate Data (Frontend & Backend)
     │
     ▼
Store in MongoDB (Status: Pending)
     │
     ▼
Send Confirmation Email (Background Thread)
     │
     ▼
Return Success Response to UI
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
│   │   ├── Admin.jsx          # Admin dashboard component
│   │   ├── App.css            # Chat styles (Luxury theme)
│   │   ├── Admin.css          # Admin dashboard styles
│   │   └── index.css          # Global styles & variables
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
- Gmail account (for sending emails)

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
   
   Create `.env` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_atlas_connection_string
   DB_NAME=sv_royal
   GEMINI_API_KEY=your_gemini_api_key
   
   # Email Configuration
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
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
   - **Environment Variables**: Add all variables from your `.env` file.

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
```json
{ "question": "What are your room rates?", "user_id": "user_123" }
```

### **POST /bookings**
Create a new booking and send confirmation email.
```json
{
  "guest_name": "John Doe",
  "email": "john@example.com",
  "phone": "+919876543210",
  "check_in": "2025-12-15",
  "check_out": "2025-12-18",
  "guests": 2,
  "room_type": "Deluxe",
  "notes": "Late check-in"
}
```

### **GET /bookings**
List all bookings (Admin).
- Query Param: `status` (optional)

### **PATCH /bookings/:booking_id**
Update booking status (Admin).
```json
{ "status": "confirmed" }
```

### **GET /analytics**
Get dashboard metrics (Admin).

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

<div align="center">

**Made with ❤️ for SV Royal Hotel**

⭐ Star this repo if you find it helpful!

</div>
