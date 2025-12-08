# Quick Start - Deploy to Render (Easiest)

## Step 1: Prepare Your Repository

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit: SV Royal Chatbot"
```

## Step 2: Push to GitHub

```bash
git remote add origin https://github.com/yourusername/sv-royal-chatbot.git
git push -u origin main
```

## Step 3: Deploy Backend on Render

1. Go to [render.com](https://render.com) and sign up
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Fill in these details:
   - **Name**: `sv-royal-backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Region**: Choose closest region

5. Click **Create Web Service**

6. Once deployed, note the backend URL (e.g., `https://sv-royal-backend.onrender.com`)

## Step 4: Add Environment Variables

In Render dashboard (Web Service → Environment):

```
MONGODB_URI=mongodb+srv://228x1a42h3:Manvith9689@sv-hotel.rrjcucd.mongodb.net/?appName=SV-Hotel
DB_NAME=sv_royal
GEMINI_API_KEY=AIzaSyCAcACOUbKx23xGiLbFGuYJWxhwLANN88k
```

## Step 5: Update Frontend API URL

Before deploying frontend, edit `frontend/src/App.jsx`:

Replace:
```jsx
const API_BASE = 'http://localhost:5000';
```

With:
```jsx
const API_BASE = 'https://sv-royal-backend.onrender.com';
```

Then commit and push:
```bash
git add frontend/src/App.jsx
git commit -m "Update API base URL for production"
git push
```

## Step 6: Deploy Frontend on Render

1. Click **New +** → **Static Site**
2. Connect same GitHub repository
3. Fill in these details:
   - **Name**: `sv-royal-frontend`
   - **Build Command**: `cd frontend && npm run build`
   - **Publish Directory**: `frontend/dist`

4. Click **Create Static Site**

## Step 7: Test Your Deployment

1. Wait for both services to finish deploying (green checkmarks)
2. Click on frontend URL
3. Test asking questions about the hotel
4. Test location map links

## Done! 🎉

Your chatbot is now live! Share the frontend URL with users.

---

## Troubleshooting

### Backend deployment fails
- Check `requirements.txt` is in root directory
- Verify `Procfile` exists
- Check Render logs for errors

### Frontend shows blank page
- Clear browser cache
- Check browser console for errors (F12)
- Verify API URL is correct

### "Cannot reach backend" error
- Check backend service is running (green in Render)
- Verify API URL in `App.jsx` is correct
- Check CORS is enabled in `app.py`

---

## Next Steps

- Set up custom domain (Render allows this)
- Configure monitoring and alerts
- Set up automatic deployments on git push
- Enable email notifications for errors
