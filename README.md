# 📚 Study Repository — Full Stack MERN App

A production-ready platform for students to upload, share, and discover academic resources.

---

## 🗂 Project Structure

```
studyrepo/
├── server/          ← Express.js + MongoDB backend
│   ├── config/      ← DB + Cloudinary setup
│   ├── controllers/ ← Route handlers
│   ├── middleware/  ← Auth + upload middleware
│   ├── models/      ← Mongoose schemas
│   ├── routes/      ← API route definitions
│   └── server.js    ← Entry point
└── client/          ← React + Vite frontend
    └── src/
        ├── components/
        ├── pages/
        ├── services/  ← Axios API client
        └── store/     ← Zustand state management
```

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Cloudinary account (free tier works)

### 1. Clone and install
```bash
git clone <your-repo-url>
cd studyrepo
npm run install:all
```

### 2. Configure server environment
```bash
cd server
cp .env.example .env
# Edit .env with your actual credentials
```

**Required `.env` values:**
```
MONGO_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/studyrepo
JWT_SECRET=<run: openssl rand -hex 32>
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
CLIENT_ORIGIN=http://localhost:5173
```

### 3. Configure client environment
```bash
cd client
cp .env.example .env
# For local dev leave VITE_API_URL empty (Vite proxy handles it)
```

### 4. Run both servers
```bash
# From project root:
npm run dev
# Frontend → http://localhost:5173
# Backend  → http://localhost:5000
```

---

## 🚀 Quick Deployment (Unified Host)

The application is now configured for a **unified deployment** (Server hosts the Client). This is simpler, avoids CORS issues in production, and only requires a single service.

### 🌎 Recommended Host: [Render](https://render.com)

1.  **New Web Service** → Connect your GitHub repo.
2.  **Build Command**: `npm run build`
3.  **Start Command**: `npm start`
4.  **Environment**: Add all variables from `server/.env.example`.
5.  Set `NODE_ENV=production` and `PORT=5000`.

> [!IMPORTANT]
> For more details (Docker, Atlas, Cloudinary setup), see [PRODUCTION.md](file:///c:/Users/KRISHNA%20BOBADE/Downloads/studyrepo/studyrepo/PRODUCTION.md).

### Database → MongoDB Atlas

1. Create free M0 cluster at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas)
2. Add a database user
3. Whitelist all IPs: `0.0.0.0/0` (or Render's specific IPs)
4. Copy connection string to `MONGO_URI`

### File Storage → Cloudinary

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Copy Cloud Name, API Key, API Secret from Dashboard
3. Add to `.env`

---

## 🔑 API Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, receive JWT |
| GET | `/api/auth/me` | JWT | Get current user |
| GET | `/api/resources` | JWT | List/search resources |
| POST | `/api/resources` | JWT | Upload new resource |
| GET | `/api/resources/:id` | JWT | Get resource detail |
| DELETE | `/api/resources/:id` | JWT+Owner | Delete resource |
| POST | `/api/resources/:id/download` | JWT | Track download |
| GET | `/api/resources/:id/comments` | JWT | Get reviews |
| POST | `/api/resources/:id/comments` | JWT | Add review |
| GET | `/api/users/me` | JWT | Get own profile |
| PATCH | `/api/users/me` | JWT | Update profile |
| GET | `/api/users/me/uploads` | JWT | My uploaded files |
| GET | `/api/notifications` | JWT | Get notifications |
| PATCH | `/api/notifications/mark-all-read` | JWT | Mark all read |
| GET | `/api/analytics/stats` | JWT | Platform stats |

---

## 🛡 Security Features

- JWT authentication (7-day expiry)
- bcrypt password hashing (cost factor 12)
- Rate limiting (200 req/15min general, 10 login attempts/15min)
- MongoDB injection sanitization (`express-mongo-sanitize`)
- Helmet.js security headers
- CORS with allowlist
- File type + size validation (50 MB max)
- Role-based access control (student / teacher / admin)

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| State | Zustand |
| Routing | React Router v6 |
| HTTP | Axios with interceptors |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose ODM |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Files | Cloudinary + Multer |
| Fonts | Syne (display), DM Sans (body), JetBrains Mono |

---

## 👥 Team

| Name | Roll No |
|------|---------|
| Krishna Bobade (Lead) | 1272240613 |
| Parth Deshmukh | 1272240432 |
| Jasnoor Singh | 1272240588 |

MIT World Peace University, Pune — SYBCA-B — AY 2025-26
