# Application Flow Document (APP_FLOW) — Study Repository

This document maps the user flows, page routes, and system data flows in Study Repository.

---

## 1. Navigation Hierarchy
Below is the structural navigation map of the application:

```
[Public Visitor Landing]
   │
   ├──> /login (Email domain validation check)
   └──> /register (MIT-WPU domain lock, uploads avatar profile)
         │
         └──> /forgot-password (Trigger OTP security verification code)
               └──> /reset-password/:token (Submit new passwords securely)

[Authenticated User Shell] (Protected Layout)
   │
   ├──> /dashboard (Represents home base. View stats & trending uploads feed)
   ├──> /programs (Explore college schools, departments, and course categories)
   ├──> /browse (Grid page listing all uploads, filters by semester and file type)
   ├──> /upload (Upload form for new resources, validates file sizes)
   ├──> /my-files (View and delete personal resource uploads)
   ├──> /profile (Customize personal profile data, bio, course, and avatar settings)
   └──> /profile/:id (View another user's profile statistics and activity feeds)

[Admin Management Panel] (Access locked to super_admin roles)
   │
   ├──> /admin/users (Lists all users, supports account deletions and roles changes)
   ├──> /admin/resources (Auditing grid to review and delete inappropriate uploads)
   ├──> /feedback (Inspect direct user feedback and bug submissions)
   └──> /admin/logs (Read system events and file activity logs)
```

---

## 2. Core Application Flows

### 2.1 Registration & Authentication Flow
We restrict access to verified institutional emails:

```
[Register Page] ──(Validates Email ends with @mitwpu.edu.in)──> [Register Account]
                                                                        │
                                                                 (Hashes Password)
                                                                        │
[Success Toast] <──(Generates JWT & Stores Session) <──(Compares Credentials) <── [Login Page]
```

1. **Domain Lock:** The user enters registration details. The client validates that the email ends with `@mitwpu.edu.in`.
2. **Submit Form:** If valid, the client sends a POST request to `/api/auth/register`. The server hashes the password with `bcrypt` (10 rounds) and creates the user document.
3. **Session Establishment:** Upon successful login, the server responds with a JWT. The client stores this token in Zustand, unlocking all protected routes.

---

## 2.2 Document Upload Flow
This flow tracks how files are securely uploaded without loading down the server's hard drive:

```
[Upload Form] ────(Validate title, category, select PDF)────> [Submit Multipart Form]
                                                                     │
                                                             (Multer holds buffer)
                                                                     │
[Saved URL in DB] <──(Database write success) <──(Cloudinary CDN secure URL) <──(Streams buffer)
```

1. **Client Checks:** The user fills out the file info (title, subject, semester, file type) and attaches a PDF. React validates that the file size is under 50MB.
2. **Multipart Request:** The form is submitted as a `multipart/form-data` POST request to `/api/resources`.
3. **Memory Buffer:** Express intercepts the file using `multer`. Instead of saving it locally, Multer stores it as a buffer in memory.
4. **Cloudinary Stream:** The controller streams the buffer directly to Cloudinary using the upload stream API.
5. **Database Entry:** Cloudinary returns a secure URL. The controller creates a new document in MongoDB containing the file's metadata and URL, returning a success toast to the user.

---

## 2.3 Resource Search & Filtering Flow
This flow handles how files are filtered and displayed to the user:

```
[Search Input] ────(User inputs keyword)────> [Express API GET /resources]
                                                       │
                                            (Builds search query)
                                                       │
[Render list] <──(JSON payload return) <──(Database matches Title/Subject/Tags)
```

1. **Trigger Query:** The user enters a search query or selects filter tags (e.g., "Semester 3", "Lab manual") on the `/browse` page.
2. **API Request:** The frontend triggers a debounced request to the GET `/api/resources` endpoint with search parameters as query strings.
3. **Mongoose Execution:** The backend runs a search query:
   ```javascript
   const query = {
     $or: [
       { title: { $regex: req.query.search, $options: 'i' } },
       { subject: { $regex: req.query.search, $options: 'i' } }
     ]
   };
   ```
4. **Instant Render:** The search results are returned as a JSON array and displayed instantly on the page without a full reload.

---

## 2.4 Document Interaction Flow (Bookmarking, Rating & Commenting)
This flow tracks how students interact with uploaded resources:

* **Rating Flow:** A user clicks a rating star (1-5). The client sends a request to POST `/api/resources/:id/rate`. The server recalculates the resource's `averageRating` and updates it in the database.
* **Bookmarking Flow:** The user clicks the bookmark icon. The backend adds the resource ID to the user's `bookmarks` array. This updates the icon dynamically to show the file is saved.
* **Commenting Flow:** A user types a comment and submits it. The backend saves the comment, updates the resource document, and adds it to the user's activity feed.

---

## 2.5 Admin Operations Sequence Flow
This flow details how administrators manage the platform:

```
   [Admin User]                  [Socket.io Server]                [Active Users]
        │                                │                                │
        ├────── Post Announcement ──────>│                                │
        │                                ├────── Broadcast Alert ────────>│
        │                                │                                │
        ├────── Delete File ────────────>│                                │
        │                                ├── Remove Resource from Feed ──>│
```

1. **Dashboard Login:** The admin signs in. The app checks if their JWT role is `super_admin` before rendering admin links.
2. **Banning Users:** Admin opens `/admin/users` and clicks "Delete Account". The server runs a cascading delete script, cleaning up the user's profile and files.
3. **Announcement Broadcast:** The admin types an alert and hits "Send". The server broadcasts the announcement to all connected clients via WebSockets (`Socket.io`). Users see a popup modal alert instantly.
