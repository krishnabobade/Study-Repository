# 🚀 Study Repository - Enterprise Product Requirements Document (PRD)

## 1. EXECUTIVE SUMMARY
**Project Name:** Study Repository
**Product Type:** Academic Resource Management SaaS Platform
**Platform Category:** EdTech / Peer-to-Peer File Sharing Network
**Product Vision:** To democratize academic knowledge by providing a secure, centralized, and highly engaging platform where students can seamlessly share, discover, and collaborate on educational resources.
**Business Goal:** To become the primary institutional digital library and peer-to-peer sharing hub, replacing fragmented physical and unorganized digital sharing methods.
**Platform Mission:** Empower students with instant access to high-quality academic materials while incentivizing contribution through an intuitive, beautifully designed, and highly performant interface.

**High-Level Overview:**
Study Repository is a modern, full-stack web application designed for modern academic institutions. Built on the MERN stack with realtime socket integrations, it serves as a secure vault for study materials (Notes, Question Papers, Lab Manuals, etc.). It entirely bypasses the traditional constraints of localized file sharing by using cloud-native architectures (MongoDB Atlas & Cloudinary) and provides an unparalleled user experience through a dynamic dual-theme UI, skeleton loading states, and micro-interactions.

---

## 2. PROBLEM STATEMENT
**Academic resource sharing is currently broken.**
- **Traditional Limitations:** Students rely on fragmented WhatsApp groups, lost Google Drive links, and physical pen drives to share crucial academic notes.
- **Resource Discoverability:** Finding a specific previous year's question paper (PYQ) or a high-quality lab manual is extremely difficult right before exams.
- **Quality Control:** Existing unofficial networks lack moderation, leading to duplicate, corrupted, or low-quality files.
- **File Management Inefficiencies:** Localized institutional networks are often inaccessible off-campus, preventing students from studying at home.

**The Solution:** Study Repository creates an accessible, globally available, 24/7 moderated cloud ecosystem where categorization, searching, and peer verification solve these inefficiencies instantly.

---

## 3. PRODUCT OVERVIEW
**Main Purpose:** A centralized, user-driven digital repository for academic materials.
**Platform Workflow:**
1. User authenticates securely.
2. User uploads a file, categorizes it by course, semester, and type.
3. The system securely stores the file in Cloudinary and indexes the metadata in MongoDB.
4. Other users search, filter, and instantly download the verified resource.
5. `super_admin` moderates content, manages users, and broadcasts announcements.

---

## 4. TARGET USERS & USER PERSONAS

### 👨‍🎓 Students (Primary Users)
- **Goals:** Quickly find exam-relevant study materials; share high-quality notes to build a public academic profile.
- **Pain Points:** Lack of time during exams, dead links, unorganized files.
- **Platform Usage:** Heavy usage of the 'Browse' filtering system, 'Download' functionality, and the 'My Files' management dashboard.

### 🛠️ Super Admin (Platform Operators)
- **Goals:** Maintain the integrity, security, and quality of the platform.
- **Pain Points:** Spam uploads, inappropriate content, managing user access.
- **Platform Usage:** Bulk approval/rejection of resources, user suspension/deletion, broadcasting system-wide announcements, monitoring analytics and logs.

*(Note: During platform maturation, rigid hierarchical roles like `teacher` and `hod` were deprecated in favor of a unified, democratized student-sharing model overseen by strict `super_admin` moderation, drastically improving deployment scalability).*

---

## 5. FEATURE DOCUMENTATION

### 🔐 Authentication System
- **Signup/Login Flow:** JWT-based stateless authentication. Users provide Institutional IDs/Emails.
- **Session Handling:** Secure, HttpOnly equivalent client-side JWT management with `zustand` persistent storage.
- **Consent Systems:** Explicit Cookie Consent and automated Terms of Service acceptance tracking.
- **Route Protection:** React Router DOM guards preventing unauthorized access to `Dashboard`, `Upload`, and `Admin` pages.

### 📚 Resource Management System
- **Resource Upload:** Multipart form-data handling via `multer` securely streamed directly to Cloudinary.
- **Validation:** Strict file size limits (50MB max), PDF/Image verification, and duplicate hash checking.
- **Search & Filter:** Multi-faceted querying (Category, Course, Semester, File Type) executing optimized MongoDB `$match` aggregations.
- **Analytics Tracking:** Every download increments a tracker, automatically pushing popular files to the "Trending" dashboard.

### 🛠️ Admin Panel Features
- **User Management:** Complete CRUD capabilities over the user base.
- **Resource Moderation:** Single-click deletion of flagged/inappropriate materials.
- **System Broadcasts:** Ability to push realtime global announcements via Socket.io to all connected users.
- **Feedback Management:** Dedicated inbox for reading and marking user-submitted bug reports and feedback.

### 🆘 Support & Legal System
- **Help Center:** Integrated FAQ and troubleshooting guides.
- **Bug Reporting:** Authenticated form allowing users to directly message admins with platform issues.
- **Legal:** Dedicated, accessible pages for Privacy Policy and Terms & Conditions.

---

## 6. UI/UX DESIGN SYSTEM DOCUMENTATION
- **Design Language:** Modern, Glassmorphic, and dynamic.
- **Theme System:** Fully integrated Dual-Theme (Light/Dark mode) managed globally via `zustand` and Tailwind CSS variables. Smooth color transitions on toggle.
- **Typography:** Display fonts for headers, highly legible sans-serif for body.
- **Skeleton Loading:** Custom `framer-motion` integrated shimmer skeletons (`SkeletonCard`, `SkeletonList`, `SkeletonTable`) completely replacing generic loading spinners for enterprise-grade perceived performance.
- **Micro-interactions:** Comprehensive hover states, tap deflations (`whileTap`), and staggered list animations using Framer Motion.
- **Responsiveness:** Mobile-first Tailwind implementation ensuring 100% usability on phones, tablets, and desktops.

---

## 7. FRONTEND ARCHITECTURE
- **Framework:** React 18 powered by Vite for lightning-fast HMR and optimized production bundling.
- **State Management:** `zustand` for lightweight, boilerplate-free global state (Auth, Theme).
- **Routing:** `react-router-dom` with lazy-loaded code splitting (`React.lazy` and `Suspense`).
- **API Layer:** Centralized `axios` instance (`api.js`) with automatic JWT injection, 401 interceptors, and graceful failure recovery (exponential backoff).
- **SEO:** `react-helmet-async` managing dynamic `<title>` and `<meta>` tags per route.

---

## 8. BACKEND ARCHITECTURE
- **Framework:** Node.js with Express.
- **Pattern:** strict MVC (Model-View-Controller) architecture.
- **Middleware:** Custom authentication guards (`auth.js`), role validators (`role.js`), and centralized error handling capturing stack traces selectively based on environment.
- **Realtime:** `Socket.io` attached to the HTTP server for instant notification delivery.

---

## 9. DATABASE DOCUMENTATION (MongoDB)
- **User Model:** Stores credentials, `totalDownloads`, `viewedResources`, and `role` (`student`, `super_admin`).
- **Resource Model:** Core entity containing `title`, `cloudinaryUrl`, `subject`, `category`, and indexing for ultra-fast `$regex` search querying.
- **Feedback Model:** Tracks user bug reports with `read/unread` status tracking.
- **Notification Model:** Relational schema linking users to system alerts.

---

## 10. CLOUD & STORAGE INTEGRATION
- **Database:** MongoDB Atlas (Serverless cloud database).
- **Blob Storage:** Cloudinary.
  - **Architecture:** Files are intercepted by Multer (memory storage), buffered, and directly streamed to Cloudinary using `uploadStream`. This prevents the Node server's local disk from filling up, making the backend completely stateless and horizontal-scaling ready.

---

## 11. API DOCUMENTATION (Core Endpoints)
- `POST /api/auth/register` - Creates user, issues JWT.
- `POST /api/auth/login` - Authenticates user, triggers login rate-limiter.
- `GET /api/resources?search=&category=` - Highly optimized paginated fetch for Browse page.
- `POST /api/resources/upload` - Secure multipart stream to Cloudinary.
- `GET /api/admin/users` - Protected super_admin route to fetch platform demographics.
- `GET /api/analytics/stats` - Dashboard metrics with built-in 30-second memory caching to prevent DB overload.

---

## 12. SECURITY DOCUMENTATION
- **Helmet:** Injects security headers (HSTS, NoSniff, XSS-Protection).
- **Express-Mongo-Sanitize:** Strips malicious `$where` and `$regex` injections from payload bodies.
- **Rate Limiting:** Global API limiter (300 req/15min) and a strict Login Bruteforce limiter (10 req/15min).
- **CORS:** Dynamically mapped to accept `localhost` during dev and strictly `.vercel.app` or `FRONTEND_URL` in production.

---

## 13. PERFORMANCE & OPTIMIZATION
- **React Code Splitting:** Every route is individually chunked by Vite, drastically reducing the initial JavaScript bundle size.
- **Memory Caching:** High-traffic endpoints like `/api/analytics/stats` utilize local memory caching to reduce redundant MongoDB hits.
- **Visual Performance:** Advanced CSS-based skeleton screens reduce Cumulative Layout Shift (CLS) during data fetching.

---

## 14. DEPLOYMENT ARCHITECTURE
### Frontend (Vercel)
- **Framework Preset:** Vite
- **Root Directory:** `client`
- **Output:** `dist`
- **Routing:** `vercel.json` configured to rewrite `/(.*)` to `index.html` preventing SPA 404s.
- **Env:** `VITE_API_URL` pointing to Render backend.

### Backend (Render)
- **Environment:** Node.js Web Service
- **Root Directory:** `server`
- **Start Command:** `node server.js`
- **Port Binding:** Strictly listens on `0.0.0.0` to satisfy Render's health checks.

---

## 15. PROJECT STRUCTURE
```text
studyrepo/
├── client/                 # Frontend React Application
│   ├── src/
│   │   ├── components/     # Reusable UI (Buttons, Skeletons, Modals)
│   │   ├── pages/          # Route-level views (Dashboard, Browse)
│   │   ├── store/          # Zustand global state
│   │   └── services/       # Axios API layer
│   ├── vite.config.js      # Bundler config
│   └── vercel.json         # Vercel deployment config
└── server/                 # Backend Node Application
    ├── controllers/        # Business logic
    ├── models/             # Mongoose Schemas
    ├── routes/             # Express API routers
    ├── middleware/         # Security & Auth guards
    └── server.js           # App entry point & configurations
```

---

## 16. SYSTEM FLOW: UPLOAD TO DOWNLOAD
1. User clicks **Upload** -> Selects local file.
2. Frontend validation checks size/type -> Transmits via `FormData`.
3. Backend `multer` buffers file in RAM -> Streams to Cloudinary via `cloudinary.uploader.upload_stream`.
4. Cloudinary returns secure HTTPS URL -> Backend saves Resource document in MongoDB.
5. User B navigates to **Browse** -> React fetches Resources -> Renders `SkeletonCard` until promise resolves.
6. User B clicks **Download** -> Backend increments `downloads` counter -> Frontend triggers `window.open(cloudinary_url)`.

---

## 17. FUTURE IMPROVEMENTS & SCALABILITY
- **Global CDN Caching:** Implement Redis for heavier query caching as the user base expands.
- **AI Integration:** Implement automated PDF summarization using Google Gemini (skeleton logic exists in `package.json`).
- **WebRTC:** Peer-to-peer live study rooms.
- **Microservices:** Detach Socket.io into a dedicated realtime notification server if concurrent connections exceed 10,000.
