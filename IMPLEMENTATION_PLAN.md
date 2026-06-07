# Retrospective Implementation Roadmap — Study Repository

This document serves as a retrospective roadmap detailing how Study Repository was researched, designed, built, optimized, and deployed.

---

## Phase 1: Research and Planning
* **Tasks Performed:**
  * Interviewed classmates about how they currently share notes and what features they wanted in a study portal.
  * Researched cloud storage options (AWS S3 vs. Cloudinary vs. gridFS) for hosting student uploads.
  * Selected the MERN stack for its database flexibility and single-language developer velocity.
* **Challenges Faced:**
  * Storing heavy PDF files directly in MongoDB is bad practice and would quickly exceed the database's 16MB document limit.
* **Solutions Implemented:**
  * Decided to use Cloudinary for file hosting, storing only lightweight HTTPS asset links in MongoDB.
* **Lessons Learned:**
  * Offload static media storage from your main application servers as early as possible.

---

## Phase 2: UI/UX Design
* **Tasks Performed:**
  * Drafted mobile-first layouts, focusing on quick document access.
  * Chose a deep indigo theme palette (variables stored in CSS tokens) to reduce eye strain.
  * Designed skeleton card blocks to keep page layouts stable during load states.
* **Challenges Faced:**
  * Generic loading spinners felt slow and disrupted the user experience.
* **Solutions Implemented:**
  * Replaced all page loaders with CSS-shimmering skeleton components matching card layouts.
* **Lessons Learned:**
  * Skeleton components make perceived load times feel much faster than traditional loading spinners.

---

## Phase 3: Frontend Development
* **Tasks Performed:**
  * Initialized the client using Vite for fast build speeds.
  * Configured protected routes and lazy-loaded views via React Router.
  * Built global stores for Auth and Theme controls using Zustand.
* **Challenges Faced:**
  * Cumulative Layout Shifts (CLS) occurred when dynamic list data populated card containers.
* **Solutions Implemented:**
  * Applied fixed height limits on card text containers and grid elements to keep layouts stable.
* **Lessons Learned:**
  * Set explicit dimensions on containers that load dynamic user content.

---

## Phase 4: Backend Development
* **Tasks Performed:**
  * Configured the Express application base in `server.js`.
  * Set up an MVC structure, separating routes, database schemas, and request controllers.
  * Integrated security middleware like `helmet`, `cors`, and API rate limiters.
* **Challenges Faced:**
  * Repeating validation logic in different controllers made the codebase difficult to maintain.
* **Solutions Implemented:**
  * Created reusable middleware handlers to validate inputs and authenticate requests.
* **Lessons Learned:**
  * Use middleware chains early to keep your controller code clean.

---

## Phase 5: Database Integration
* **Tasks Performed:**
  * Set up a cluster on MongoDB Atlas and connected it to Express using Mongoose.
  * Wrote Mongoose schemas for Users, Resources, and Comments with validation rules.
  * Implemented automatic profanity filtering on schema pre-save hooks.
* **Challenges Faced:**
  * Text searches became noticeably slow once we loaded the database with test files.
* **Solutions Implemented:**
  * Added indexes to frequently queried fields (`subject`, `course`) and configured text indexing for titles and descriptions.
* **Lessons Learned:**
  * Set up database indexes early during development before your database grows.

---

## Phase 6: Authentication
* **Tasks Performed:**
  * Wrote endpoints for user registration, login, and password resets using 6-digit OTPs.
  * Implemented JWT token generation on logins and verification checks in Express middleware.
  * Configured Axios instances to automatically add auth headers to requests.
* **Challenges Faced:**
  * Reloading the page caused the app state to lose track of whether the user was logged in.
* **Solutions Implemented:**
  * Synchronized Zustand's auth state with local storage to persist active sessions across reloads.
* **Lessons Learned:**
  * Always verify JWT tokens on the server for secure operations; never rely on the client to manage authentication state alone.

---

## Phase 7: File Upload System
* **Tasks Performed:**
  * Configured Multer to handle incoming file uploads in multipart forms.
  * Integrated the Cloudinary SDK and set up media library configurations.
  * Wrote controller endpoints to stream files to Cloudinary and save the URLs in MongoDB.
* **Challenges Faced:**
  * Free-tier servers (like Render) have small temporary storage disks, meaning saving files locally before uploading causes issues.
* **Solutions Implemented:**
  * Configured Multer to store incoming uploads as temporary memory buffers, which are streamed directly to Cloudinary.
* **Lessons Learned:**
  * Streaming file uploads directly from memory is faster and safer than writing temp files to disk.

---

## Phase 8: Testing
* **Tasks Performed:**
  * Ran manual tests on file uploads, deletes, profile updates, and responsive drawer menus.
  * Tested security rules (e.g. verifying that a standard user cannot delete another student's PDF).
* **Challenges Faced:**
  * Creating test profiles manually to test ratings and comments was tedious.
* **Solutions Implemented:**
  * Wrote automated database seeding scripts to instantly populate local database runs with mock users, uploads, and comments.
* **Lessons Learned:**
  * Seeding scripts save hours of development time when testing user interactions.

---

## Phase 9: Optimization
* **Tasks Performed:**
  * Configured component memoization (`memo`, `useCallback`, `useMemo`) to stop unnecessary re-renders.
  * Cleaned up unused Lucide icon imports, reducing the overall application bundle size.
  * Audited Mongo queries, using `.select()` to exclude large, unused database fields.
* **Challenges Faced:**
  * Large JavaScript bundle sizes caused long page load times on slower mobile networks.
* **Solutions Implemented:**
  * Utilized lazy loading and code splitting to divide the bundle into smaller, page-specific chunks.
* **Lessons Learned:**
  * Regularly audit your third-party imports to keep your compiled bundles lightweight.

---

## Phase 10: Deployment Preparation
* **Tasks Performed:**
  * Deployed the frontend to Vercel and configured rewrite rules in `vercel.json` to support client-side routing.
  * Hosted the backend API on Render, connecting it to the database cluster.
  * Configured secure production variables (JWT secrets, Mongo connection string, Cloudinary API keys).
* **Challenges Faced:**
  * Render's free tier puts web services to sleep after 15 minutes of inactivity, causing a 50-second delay when a student first loads the app.
* **Solutions Implemented:**
  * Set up an external cron service to ping the backend API health check endpoint (`/api/health`) every 10 minutes to keep it active.
* **Lessons Learned:**
  * Keep free-tier containers active by setting up automated ping health checks.
