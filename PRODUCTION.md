# 🚀 Production Deployment Guide

This guide ensures your Study Repository is ready for a professional deployment.

## 🛠 Prerequisites
1.  **MongoDB Atlas**: Create a cluster and get your connection string.
2.  **Cloudinary**: Create an account for file storage (Image/PDF handling).
3.  **A Host**: Render, Railway, DigitalOcean, or a VPS with Node.js 18+.

## 🔒 Environment Variables
Your production environment MUST have these variables set:

| Variable | Description | Example |
|---|---|---|
| `MONGO_URI` | MongoDB Connection string | `mongodb+srv://...` |
| `JWT_SECRET` | A long random string | `64-char-hex-code` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary name | `my-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary key | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary secret | `secret-key` |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `5000` |
| `CLIENT_ORIGIN` | Allowed domains | `https://your-app.com` |

## 📦 Deployment Options

### Option A: Render (Unified Deployment)
Render will now handle both frontend and backend in a single service.
1.  **New Web Service** → Connect your GitHub repo.
2.  **Runtime**: `Node.js`
3.  **Build Command**: `npm run build`
4.  **Start Command**: `npm start`
5.  Set all Environment Variables in the "Environment" tab.

### Option B: Docker (Any Cloud)
If you have Docker installed or are using a platform like Google Cloud Run/AWS:
```bash
docker build -t study-repo .
docker run -p 5000:5000 --env-file .env study-repo
```

## ✅ Post-Deployment Checks
1.  **Health Check**: Visit `https://your-url.com/api/health`.
2.  **DB Seeding**: If it's a fresh DB and you want initial admin accounts:
    - Run `npm run seed` in the terminal (or through the host's "Console" tab).
    - Email: `admin@mitwpu.edu.in` / Password: `adminPassword123`
3.  **CORS**: Ensure `CLIENT_ORIGIN` matches your public domain.

## 🗄️ Database Readiness
The application is optimized for MongoDB with:
- **Text Indexes**: Fast searches on title, description, and subjects.
- **Compound Indexes**: Faster filtering by Course, Semester, and Category.
- **Sanitization**: Protection against NoSQL Injection using `express-mongo-sanitize`.
