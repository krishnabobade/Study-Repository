# Product Requirements Document (PRD) — Study Repository

## 1. Project Overview
Study Repository is a full-stack, college-centric academic resource-sharing platform. It acts as a digital hub where students and faculty can upload, organize, discover, and access study materials like lecture notes, past exam question papers, lab manuals, practical assignments, and reference PDFs. 

The website is fully designed, built, and operational. It bridges the gap between students seeking reliable study content and creators (students/teachers) wanting a clean space to share verified academic files.

---

## 2. Problem Statement
Before building this platform, sharing study material in college was incredibly unorganized:
* **Cluttered WhatsApp Groups:** Important PDFs easily got lost in hundreds of daily chats. Searching through group media history is tedious.
* **Broken or Private Drive Links:** Random Google Drive links shared by seniors often expired, or required manual access approval, which is useless the night before an exam.
* **Institutional Boundaries:** Material is specific to the college syllabus, but public sites like SlideShare or Scribd are cluttered with generic content, paywalls, and irrelevant search results.
* **No Peer Validation:** Students couldn't rate or comment on files, so there was no way to know if a set of notes was accurate or for the correct syllabus code.

---

## 3. Motivation
As a BCA student, I frequently faced the frustration of hunting down previous year question papers (PYQs) and lab files. I wanted to build a practical, real-world application to solve this campus problem while mastering the MERN stack (MongoDB, Express, React, Node.js) and learning how to deploy production-grade software using third-party services like Cloudinary for storage.

---

## 4. Goals and Objectives
* **Centralization:** Create a single repository accessible 24/7 for all college departments.
* **Syllabus Alignment:** Ensure resources are structured by course, subject code, and semester.
* **Spam Prevention:** Lock registration specifically to the college domain (`@mitwpu.edu.in`) to keep the platform clean and trusted.
* **Seamless Search:** Build a system where files can be discovered in less than 3 clicks using keyword queries and category filters.
* **Peer Verification:** Allow the student community to upvote, downvote, rate, and comment on notes so high-quality files naturally rise to the top.

---

## 5. User Personas

### Persona A: Rohan (Student)
* **Profile:** 2nd-year BCA student.
* **Needs:** Needs to find previous year question papers (PYQs) and lab manual programs quickly during exam preparation.
* **Frustrations:** WhatsApp groups are muted due to spam, drives are empty, and he cannot afford paid study websites.
* **Goal:** Log in, search "Python Programming PYQ," view rating comments, download the PDF instantly, and bookmark it for offline review.

### Persona B: Dr. Anjali Sharma (Faculty Member)
* **Profile:** Assistant Professor in Computer Science.
* **Needs:** Wants to share official lecture presentations, assignments, and reference guides with all her divisions.
* **Frustrations:** Sending materials via email attachments results in size limit errors, and students repeatedly ask for files they missed.
* **Goal:** Upload a 20MB lecture PDF once, tag it by course and semester, and know that all students can access it securely.

### Persona C: College Admin
* **Profile:** Student Coordinator or Lab Administrator.
* **Needs:** Monitor uploads to make sure copyrighted, duplicate, or inappropriate files are removed immediately.
* **Goal:** Access a centralized admin dashboard to view usage statistics, manage users, delete files, and broadcast urgent exam schedule announcements.

---

## 6. Functional Requirements

### 6.1 User Account & Auth System
* **Domain Check:** Registration must validate the email domain; only `@mitwpu.edu.in` accounts can sign up.
* **Role Settings:** Users are assigned roles (`student`, `teacher`, `super_admin`) which govern upload and deletion privileges.
* **Secure Session:** Password hashing via `bcrypt` on the backend, JWT tokens for API authorization, and token storage handled in global store.

### 6.2 Profile Management
* **Personalized Dashboard:** Display upload and download metrics.
* **Customization:** Allow users to update their bio, change their course/semester, and customize their avatar.
* **Contribution Credits:** Award reputation points (credits) dynamically when user uploads are rated positively by peers.

### 6.3 Resource Upload System
* **Metadata Fields:** Require file title, description, subject, course category, semester, and tags.
* **File Upload:** Direct buffering of PDFs/documents on the backend, then streaming to Cloudinary storage, keeping MongoDB clean of heavy binary data.

### 6.4 Resource Discovery & Interactions
* **Dynamic Search:** Match keywords against titles, subjects, and tags.
* **Filters:** Multi-parameter filtering by semester, file type, and department.
* **Peer Reviews:** Core interaction buttons for upvotes/downvotes, 5-star rating scores, and threaded comments sections.
* **Saved Files:** A bookmarking system allowing users to save files directly to their profile's personal vault.

### 6.5 Administrative Tools
* **Admin Dashboard:** Access audit logs, review user feedback, delete files, and ban spam accounts.
* **Live Notifications:** Broadcast real-time notifications and global announcements using Socket.io.

---

## 7. Non-Functional Requirements
* **Performance:** Use code-splitting and skeleton loaders so pages render immediately, even on slow mobile networks.
* **Security:** Implement database sanitization (to block NoSQL injections), cross-site scripting (XSS) headers, and API rate limiting on login/registration routes.
* **Aesthetics:** High-fidelity dark mode support, glassmorphism UI card components, and fluid micro-interactions with Framer Motion.
* **Responsiveness:** Maintain a mobile-first responsive layout with bottom navigational bars catering to safe areas on iOS and Android devices.

---

## 8. User Stories
1. **As a student**, I want to register using my college email address so I can ensure only people from my university have access to my shared files.
2. **As a student**, I want to filter notes by "Semester 3" and "Java Programming" so I don't have to scroll through irrelevant course materials.
3. **As a faculty member**, I want to upload a lecture presentation directly so I don't have to repeatedly email it to multiple student coordinators.
4. **As a student**, I want to see the average rating and peer comments on a lab manual file so I can verify its code is correct before using it.
5. **As an admin**, I want to delete inappropriate or copy-pasted files immediately from the dashboard so that the repository remains purely academic.

---

## 9. Success Metrics
* **Monthly Active Users (MAU):** Growth of active campus users.
* **Conversion to Uploaders:** Ratio of users who register vs. those who upload at least one resource.
* **Rating Activity:** Percentage of downloads that receive a subsequent review, validating content quality.
* **Load Time:** Keeping client bundle size low to guarantee under 2-second page loads.

---

## 10. Assumptions & Constraints
* **Assumption:** The college community has active access to their official university G-Suite emails.
* **Constraint:** Hosted on free-tier services (Render/Vercel/MongoDB Atlas), which means API endpoints will experience cold-start delays if inactive.
* **Constraint:** Max upload limit set to 50MB per file due to Cloudinary free-tier buffer constraints.

---

## 11. Future Scope
* **AI Summary Engine:** Introduce a pipeline to summarize uploaded PDFs automatically using Gemini API.
* **Study Rooms:** Live study sessions and whiteboard channels built on top of Socket.io.
* **Internal Chat:** Direct P2P messaging to discuss homework and share tips directly on the platform.
