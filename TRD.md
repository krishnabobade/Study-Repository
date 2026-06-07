# Technical Requirements Document (TRD) — Study Repository

## 1. System Architecture
The application follows a decoupled Client-Server architecture:
* **Frontend:** A Single Page Application (SPA) built with React and Vite. It consumes endpoints exposed by the backend and handles application state, local caching, rendering, and route protection.
* **Backend:** A RESTful API built using Node.js and Express. It acts as the business logic gatekeeper, interfaces with the database, and integrates with external storage platforms.
* **Database & Cloud Storage:** MongoDB Atlas stores structured documents and relational references. Cloudinary hosts PDF/document assets, offloading heavy file storage from our application servers.

```
+------------------+         REST API Requests       +--------------------+
|  React SPA Client| <=============================> |  Node/Express API  |
|  (Hosted Vercel) |                                 |  (Hosted Render)   |
+------------------+                                 +---------+----------+
                                                               |
                                     +-------------------------+-------------------------+
                                     |                                                   |
                                     v                                                   v
                         +-----------+-----------+                           +-----------+-----------+
                         |     MongoDB Atlas     |                           |    Cloudinary Storage |
                         |   (NoSQL Database)    |                           |     (Media CDN)       |
                         +-----------------------+                           +-----------------------+
```

---

## 2. Technology Stack Justification

### 2.1 Frontend
* **React.js & Vite:** Vite provides an incredibly fast development environment with near-instant Hot Module Replacement (HMR) and builds optimized production bundles using Rollup. React makes it easy to build reusable UI elements and manage page layouts dynamically.
* **Tailwind CSS:** Minimizes custom CSS writing, eliminates CSS namespace collisions, and keeps the styling bundle extremely small. It utilizes utility classes that compile down to standard CSS.
* **Zustand:** I chose Zustand over Redux because it is lightweight, requires minimal boilerplate, and manages auth tokens, themes, and user profile sessions smoothly.
* **Framer Motion:** Handles animations, page transitions, and slide-in drawer menus.

### 2.2 Backend
* **Node.js & Express:** Using JavaScript across the entire stack simplifies development. Express is a minimalist, fast framework that makes it easy to write clean middleware chains for routing and security.
* **Mongoose:** Provides structured schemas on top of MongoDB, making it simple to run validations (like email format checks) and populate database references.

### 2.3 Cloud Storage & Database
* **MongoDB Atlas:** A cloud-hosted document database. Since our resource entities have flexible metadata (dynamic tags, nested comment threads, and varied upvote lists), NoSQL works much better here than strict SQL tables.
* **Cloudinary:** Storing large PDF files directly in MongoDB or locally on a server like Render would quickly crash free-tier instances. Cloudinary offloads this processing, streams uploads, and delivers files via an optimized CDN.

---

## 3. Frontend Architecture
The codebase is organized logically into modules:
* `src/components/`: Split into `/layout` (Dashboard frame and sidebar menus) and `/shared` (reusable inputs, loader skeletons, rating stars, and SEO wrappers).
* `src/pages/`: Lazy-loaded page containers (Login, Dashboard, Profile, ResourceDetails) configured via React Router.
* `src/store/`: Zustand state declarations:
  * `authStore.js`: Tracks auth state, loads user profile details, and handles logins/logouts.
  * `themeStore.js`: Manages light/dark styling settings and synchronizes them with localStorage.

---

## 4. Backend Architecture
The server is structured around the Model-View-Controller (MVC) pattern:
* `/config/`: Handles initializations like MongoDB connections and Cloudinary API configuration.
* `/models/`: Schema definitions (`User.js`, `Resource.js`, `Comment.js`, etc.).
* `/controllers/`: Houses core route logic (handling user registration, file deletes, and queries).
* `/middleware/`: Intercepts requests for authentication, file uploads, and payload sanitization.
* `/routes/`: Defines REST endpoints and binds them to specific controller actions.

---

## 5. Database Architecture & Collections
Our data model maps relationships between users, resources, and interactions. We use MongoDB references (`ObjectId`) to link documents together.
* **Users:** Stores account credentials, avatar URL, semester tags, and user stats.
* **Resources:** Contains file metadata, uploader reference, average rating score, download logs, and raw Cloudinary asset URLs.
* **Comments:** Connects a user's comment to a specific resource.
* **Bookmarks:** Links users to saved resources for quick offline retrieval.

---

## 6. Authentication Flow
We use standard JWT authentication:
1. **Login/Registration Request:** The user submits their email and password.
2. **Verification & Hashing:** The backend verifies the `@mitwpu.edu.in` domain and compares passwords using `bcrypt.compare`.
3. **Token Issuance:** Upon verification, the server generates a JWT containing the user's ID and role, signed with a secret key.
4. **Local Session:** The token is returned to the client and stored in the Zustand store (and synced with localStorage).
5. **Route Protection:** For secure API calls, the frontend includes this token in the `Authorization: Bearer <token>` header. The server's `authMiddleware` decodes the token and attaches the user object to the request.

---

## 7. File Upload Architecture
We use a memory-buffer upload pipeline:
1. **Payload Generation:** The user submits a form on the React client. The PDF is appended to a `FormData` object.
2. **Buffer Interception:** The Express server receives the request. The `multer` middleware catches the file field and stores it in server memory as a temporary buffer.
3. **Direct Cloud Stream:** The controller passes this buffer directly to Cloudinary's upload stream API:
   ```javascript
   cloudinary.uploader.upload_stream({ resource_type: "raw" }, (error, result) => { ... })
   ```
4. **Metadata Preservation:** The returned secure URL and asset ID are saved in MongoDB, and the memory buffer is cleared.

---

## 8. Security Considerations
* **Input Sanitization:** We use `express-mongo-sanitize` to strip out reserved keys (like `$`) from user inputs, completely blocking NoSQL injection attacks.
* **HTTP Headers:** `helmet` is configured to set secure headers, protecting the app from clickjacking and other vulnerabilities.
* **Rate Limiting:** API rate limiting is enforced on authentication routes (`/api/auth/register` and `/api/auth/login`) to prevent brute-force attacks.
* **CORS Settings:** Access is locked to our trusted client domains to prevent unauthorized API requests.

---

## 9. Performance Considerations
* **Code Splitting:** React components are lazy-loaded via `Suspense` and `lazy()`, meaning users only download the code for the pages they actually visit.
* **Skeleton Loaders:** We avoid generic blocking spinners. Page outlines are rendered instantly using skeleton placeholders while async requests resolve in the background.
* **MongoDB Indexing:** We apply indexes to query-heavy fields like `subject`, `course`, and `uploader` references to ensure fast database searches.

---

## 10. Scalability Considerations
* **Stateless API:** The Express backend does not store session states, enabling multiple backend instances to run concurrently.
* **Decoupled Assets:** Offloading documents to Cloudinary means our app servers only process light JSON metadata, preventing disk space issues.

---

## 11. Error Handling Strategy
We use a centralized error-handling middleware in Express:
* Any error thrown inside controllers is caught by an async wrapper and forwarded using `next(error)`.
* The global handler formats the response into a clean, readable JSON object:
  ```json
  { "success": false, "message": "Detailed error message here" }
  ```
* The client interceptor displays these messages as user-friendly toast notifications via `react-hot-toast`.

---

## 12. Deployment Strategy
* **Frontend:** Deployed on **Vercel** as a static single page application. `vercel.json` is configured to redirect all routes to `index.html` to support React Router.
* **Backend:** Deployed on **Render** using a web service container linked directly to the GitHub repository for continuous integration.
* **Database:** Hosted on a shared M0 cluster on **MongoDB Atlas**, configured with access rules restricted to Render's IP addresses.
