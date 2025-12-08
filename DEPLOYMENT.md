# SV Royal Hotel Chatbot - Deployment Guide

## Overview
This guide covers deploying the chatbot on popular cloud platforms.

---

## Option 1: Deploy on Render (Recommended for Beginners)

### Prerequisites
- GitHub account
- Render account (free tier available)

### Backend Deployment

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/sv-royal-chatbot.git
   git push -u origin main
   ```

2. **Create Render Service**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Fill in settings:
     - **Name**: sv-royal-backend
     - **Environment**: Python 3
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `gunicorn app:app`
     - **Region**: Choose closest to your users

3. **Add Environment Variables**
   - In Render dashboard, go to Environment
   - Add these variables:
     ```
     MONGODB_URI=your_mongodb_atlas_uri
     DB_NAME=sv_royal
     GEMINI_API_KEY=your_gemini_api_key
     ```

4. **Deploy Frontend**
   - Go to "New +" → "Static Site"
   - Connect your GitHub repository
   - Fill in settings:
     - **Name**: sv-royal-frontend
     - **Build Command**: `cd frontend && npm install && npm run build`
     - **Publish Directory**: `frontend/dist`

5. **Update Frontend API URL**
   Before pushing, update `frontend/src/App.jsx`:
   ```jsx
   const API_BASE = 'https://sv-royal-backend.onrender.com';
   ```

---

## Option 2: Deploy on Vercel (Frontend) + Railway (Backend)

### Backend on Railway

1. **Install Railway CLI**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login and Deploy**
   ```bash
   railway login
   railway init
   railway up
   ```

3. **Add Environment Variables**
   - Go to Railway dashboard
   - Add variables in Settings

### Frontend on Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy Frontend**
   ```bash
   cd frontend
   vercel
   ```

3. **Update API URL in Environment Variables**
   - In Vercel dashboard → Settings → Environment Variables
   - Add: `VITE_API_BASE=your_railway_backend_url`

4. **Update App.jsx**
   ```jsx
   const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
   ```

---

## Option 3: Deploy on AWS

### Backend (Elastic Beanstalk)

1. **Install EB CLI**
   ```bash
   pip install awsebcli
   ```

2. **Initialize and Deploy**
   ```bash
   eb init -p python-3.11 sv-royal-backend
   eb create sv-royal-env
   eb deploy
   ```

3. **Set Environment Variables**
   ```bash
   eb setenv MONGODB_URI=your_uri GEMINI_API_KEY=your_key
   ```

### Frontend (S3 + CloudFront)

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Upload to S3**
   - Create S3 bucket
   - Upload `dist` folder contents
   - Enable static website hosting

3. **Set up CloudFront** for CDN

---

## Option 4: Deploy on Heroku (Legacy)

> Note: Heroku's free tier is discontinued. Consider other options.

---

## Required Dependencies

Install Gunicorn for production:
```bash
pip install gunicorn
```

Update `requirements.txt` (CPU-only PyTorch to keep builds small/fast):
```
--extra-index-url https://download.pytorch.org/whl/cpu
flask==3.1.2
flask-cors==5.0.0
pymongo==4.11.2
python-dotenv==1.2.1
sentence-transformers==3.3.1
google-generativeai==0.8.5
gunicorn==21.2.0
torch==2.9.1+cpu
```

---

## Production Configuration

### Flask Backend (app.py)
```python
if __name__ == "__main__":
    import os
    debug = os.getenv('FLASK_ENV') == 'development'
    app.run(debug=debug, host='0.0.0.0', port=int(os.getenv('PORT', 5000)))
```

### Frontend Environment
Create `.env.production`:
```
VITE_API_BASE=your_production_backend_url
```

---

## Post-Deployment Checklist

- [ ] Test all API endpoints
- [ ] Verify environment variables are set
- [ ] Test MongoDB connection
- [ ] Test Gemini API integration
- [ ] Test CORS settings
- [ ] Enable HTTPS
- [ ] Set up monitoring/logging
- [ ] Configure auto-scaling if needed
- [ ] Set up SSL certificate
- [ ] Test on mobile devices

---

## Monitoring & Logging

### Render/Railway
- Built-in logging available in dashboard
- Check "Logs" tab for errors

### AWS CloudWatch
```python
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
```

---

## Troubleshooting

### CORS Issues
If frontend can't reach backend:
- Check backend is accessible
- Verify CORS is enabled in Flask
- Check URL in frontend config

### MongoDB Connection Fails
- Verify MONGODB_URI format
- Check IP whitelist in MongoDB Atlas
- Ensure database exists

### Gemini API Errors
- Verify API key is correct
- Check API is enabled in Google Cloud
- Verify quota limits

---

## Cost Estimates (Monthly)

| Platform | Backend | Frontend | Total |
|----------|---------|----------|-------|
| Render | $7 | Free | $7 |
| Vercel + Railway | $5-20 | Free | $5-20 |
| AWS | $10-50 | $0.5-5 | $10.5-55 |

---

## Getting Help

- **Render Docs**: https://render.com/docs
- **Railway Docs**: https://railway.app/docs
- **Vercel Docs**: https://vercel.com/docs
- **AWS Docs**: https://docs.aws.amazon.com
