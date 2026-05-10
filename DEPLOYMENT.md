# 🚀 Study Repository - Production Deployment Guide

This document contains the complete, step-by-step instructions for deploying the **Study Repository** full-stack web application to production using **Vercel** (Frontend) and **Render / Heroku** (Backend), alongside **MongoDB Atlas** and **Cloudinary**.

---

## 🏗️ Architecture Overview

*   **Frontend:** React, Vite, Tailwind CSS, Zustand, Framer Motion
*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB Atlas (NoSQL)
*   **Storage:** Cloudinary (Document & Image Storage)

---

## 🔒 1. Environment Variables Setup

You will need to set up the following environment variables on your respective hosting platforms.

### Backend (`server/.env`)
```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/studyrepo?retryWrites=true&w=majority
JWT_SECRET=generate_a_very_secure_random_string_here
JWT_EXPIRE=7d

# Cloudinary Integration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional Integrations
AI_API_KEY=your_gemini_or_openai_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@studyrepo.edu

# Institutional Defaults
INSTITUTION_NAME=MIT World Peace University
ALLOWED_DOMAIN=@mitwpu.edu.in
```

### Frontend (`client/.env`)
```env
VITE_API_URL=https://your-backend-production-url.onrender.com/api
```

---

## ☁️ 2. Database & Cloud Storage Setup

### MongoDB Atlas Setup
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Go to **Database Access** -> Create a new user with a secure password.
3. Go to **Network Access** -> Add IP Address `0.0.0.0/0` (Allow access from anywhere, required for cloud hosting).
4. Go to **Database** -> **Connect** -> **Connect your application**.
5. Copy the connection string and replace `<username>` and `<password>`. Set this as `MONGO_URI` in the backend.

### Cloudinary Setup
1. Create a free account on [Cloudinary](https://cloudinary.com/).
2. Navigate to your **Dashboard**.
3. Copy your **Cloud Name**, **API Key**, and **API Secret**.
4. Add these to your backend environment variables.

---

## 🚀 3. Backend Deployment (Render)

We recommend [Render.com](https://render.com) for hosting the Node.js backend.

1. Sign up/Log in to Render and create a new **Web Service**.
2. Connect your GitHub repository.
3. Configure the service:
   *   **Name:** `studyrepo-backend`
   *   **Root Directory:** `server`
   *   **Environment:** `Node`
   *   **Build Command:** `npm install`
   *   **Start Command:** `npm start`
4. Expand the **Advanced** section.
5. Click **Add Environment Variables** and paste all variables from the Backend `.env` section above.
6. Click **Create Web Service**.
7. Wait for the build to finish. Once deployed, copy your backend URL (e.g., `https://studyrepo-backend.onrender.com`).

---

## ⚡ 4. Frontend Deployment (Vercel)

We recommend [Vercel](https://vercel.com) for hosting the React frontend.

1. Sign up/Log in to Vercel and click **Add New** -> **Project**.
2. Import your GitHub repository.
3. Configure the project:
   *   **Project Name:** `studyrepo`
   *   **Framework Preset:** `Vite`
   *   **Root Directory:** `client`
   *   **Build Command:** `npm run build`
   *   **Output Directory:** `dist`
4. Open the **Environment Variables** section.
5. Add the following variable:
   *   **Name:** `VITE_API_URL`
   *   **Value:** `https://studyrepo-backend.onrender.com/api` *(Use the URL you got from Render)*
6. Click **Deploy**.
7. Once finished, Vercel will provide your live production URL.

---

## ✅ 5. Final Master Checklist

Before announcing the platform to users, verify the following on your live production URLs:

- [ ] **Registration Flow:** Users can successfully create an account, and age constraints (18+) work.
- [ ] **Authentication:** Login, logout, and token expiration logic work correctly.
- [ ] **File Uploads:** Students can securely upload documents, and they appear in Cloudinary.
- [ ] **File Downloads:** Documents can be downloaded without preview modal interference.
- [ ] **Admin Panel:** Super admins can review, delete, and manage users/files.
- [ ] **Security:** MongoDB Network Access is secure, and no `.env` files are committed to GitHub.

---

**Congratulations! Your Study Repository SaaS Platform is now fully deployed and production-ready! 🎉**
