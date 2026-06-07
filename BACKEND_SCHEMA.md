# Backend Schema & API Documentation — Study Repository

This document defines the database schemas, collection relationships, API routing endpoints, folder structures, and the request-response lifecycle inside the backend.

---

## 1. Database Collections & Schemas

### 1.1 User Schema (`users` collection)
Stores credentials, profile information, and user stats.

```
                  +--------------------------------+
                  |              USER              |
                  +--------------------------------+
                  | _id: ObjectId                  |
                  | name: String                   |
                  | email: String (Unique, MIT-WPU)|
                  | password: String (Hashed)      |
                  | role: Enum (student/teacher...) |
                  | credits: Number                |
                  | savedResources: [ResourceRef]  |
                  | viewedResources: [ResourceRef] |
                  +--------------------------------+
```

* **Fields:**
  * `name`: String, required. Runs through a profanity filter before saving.
  * `email`: String, required, unique. Must end with `@mitwpu.edu.in`.
  * `password`: String, required. Excluded from default queries (`select: false`), hashed with `bcrypt`.
  * `phone` / `dob` / `gender`: Optional profile details.
  * `course` / `semester` / `yearOfStudy`: Optional academic fields.
  * `bio`: String, optional.
  * `avatar`: String, URL of selected avatar.
  * `role`: String. Enum: `['student', 'teacher', 'admin', 'college_admin', 'super_admin']`. Default is `student`.
  * `totalUploads` / `totalDownloads` / `totalLikes` / `totalDislikes` / `profileVisits` / `credits`: Numbers, defaults to 0. Used for user metrics and gamification.
  * `savedResources`: Array of ObjectIds referencing the `Resource` collection (Bookmarked resources).
  * `viewedResources`: Array of ObjectIds referencing the `Resource` collection (Recently viewed).
  * `avgRating` / `ratingCount`: Tracks user reviews.
* **Indexes:**
  * `{ institutionId: 1, role: 1 }`
  * `{ resetPasswordToken: 1 }` (for fast password lookups)

---

### 1.2 Resource Schema (`resources` collection)
Stores metadata for uploaded documents.

```
                  +--------------------------------+
                  |            RESOURCE            |
                  +--------------------------------+
                  | _id: ObjectId                  |
                  | title: String                  |
                  | fileUrl: String (Cloudinary)   |
                  | fileType: Enum (pdf, doc...)   |
                  | subject: String                |
                  | uploadedBy: UserRef            |
                  | downloads: Number              |
                  +--------------------------------+
```

* **Fields:**
  * `title`: String, required.
  * `description`: String, optional.
  * `fileUrl`: String, required. Secure URL returned from Cloudinary.
  * `filePublicId`: String, required. Cloudinary identifier, used for physical deletes.
  * `fileType`: String. Enum: `['pdf', 'doc', 'ppt', 'image', 'video', 'other']`.
  * `fileSize`: Number, stored in bytes.
  * `subject`: String, required (e.g., "Web Technologies").
  * `course`: String, required (e.g., "BCA").
  * `semester`: Number, required (1-6 for BCA).
  * `category`: String. Enum: `['notes', 'qpaper', 'assignment', 'lab', 'formula', 'project', 'other']`.
  * `tags`: Array of Strings.
  * `uploadedBy`: ObjectId, required. References the `User` collection.
  * `downloads` / `views` / `searches`: Numbers, default to 0. Used for calculating popularity.
  * `avgRating` / `ratingCount`: Calculated based on user ratings.
  * `likes` / `dislikes`: Arrays of ObjectIds referencing `User`.
* **Indexes:**
  * Text index: `{ title: 'text', description: 'text', subject: 'text' }` for search.
  * `{ downloads: -1, ratingCount: -1 }` to list trending uploads fast.

---

### 1.3 Comment Schema (`comments` collection)
Handles comments and ratings on resources.

* **Fields:**
  * `resource`: ObjectId, required. References `Resource`.
  * `user`: ObjectId, required. References `User`.
  * `rating`: Number, required. Value must be between 1 and 5.
  * `comment`: String, optional. Runs through a profanity filter.

---

### 1.4 UserReview Schema (`userreviews` collection)
Stores peer reviews for user profiles (e.g. reviewing a contributor).

* **Fields:**
  * `targetUser`: ObjectId, required. References `User`.
  * `reviewer`: ObjectId, required. References `User`.
  * `rating`: Number, required, min: 1, max: 5.
  * `comment`: String, required.
* **Indexes:**
  * Unique index on `{ targetUser: 1, reviewer: 1 }` to restrict users to one review per profile.

---

### 1.5 UserInteraction Schema (`userinteractions` collection)
Manages user likes, dislikes, and rating interactions on other profiles.

* **Fields:**
  * `targetUser`: ObjectId, required. References `User`.
  * `fromUser`: ObjectId, required. References `User`.
  * `action`: String. Enum: `['like', 'dislike', 'none']`. Default is `none`.
  * `rating`: Number, min: 1, max: 5.
* **Indexes:**
  * Unique index on `{ targetUser: 1, fromUser: 1 }` to prevent spam voting.

---

## 2. API Route Structure

### 2.1 Auth Endpoints (`/api/auth`)
* `POST /register`: Creates a user profile. Validates college email domain.
* `POST /login`: Logs in user and returns a JWT token.
* `POST /forgot-password`: Generates and emails a 6-digit password reset OTP.
* `POST /verify-otp`: Validates the password reset OTP code.
* `POST /reset-password/:token`: Submits a new password.

### 2.2 Resource Endpoints (`/api/resources`)
* `GET /`: Lists all resources. Supports search, subject filtering, and pagination.
* `POST /`: Uploads a file (passes through `multer` and uploads to Cloudinary).
* `GET /:id`: Retrieves resource details and populates uploader information.
* `DELETE /:id`: Removes a resource (deletes it from MongoDB and deletes the physical file from Cloudinary).
* `POST /:id/rate-comment`: Adds a rating score and review comment to a file.
* `POST /:id/download`: Increments download stats and redirects to the Cloudinary asset URL.

### 2.3 User Endpoints (`/api/users`)
* `GET /me`: Fetches the current user session details.
* `PATCH /me`: Updates profile details (bio, course, semester, phone, avatar).
* `POST /me/bookmark`: Toggles saving a resource to the user's bookmark array.
* `GET /me/bookmarks`: Retrieves all bookmarked files.
* `POST/:id/interact`: Submits a like, dislike, or star rating to another user's profile.

---

## 3. Middleware Architecture

```
[Request]
   │
   v
[authMiddleware.protect] ──(Fails if token missing/invalid)──> [401 Unauthorized]
   │
   v
[authMiddleware.restrictTo('admin')] ──(Fails if role not admin)──> [403 Forbidden]
   │
   v
[Controller Function] ──(Catches error inside database call)──> [next(err)]
   │                                                                    │
   v                                                                    v
[Successful JSON Response]                                   [Global Error Handler]
```

* **Authentication Middleware (`authMiddleware.protect`):** Checks the request's Authorization header for a JWT. It verifies the token signature, check expiration, and attaches the active user's details to `req.user`.
* **Role Gatekeeper (`authMiddleware.restrictTo`):** Compares `req.user.role` against authorized roles, blocking unauthorized users with a `403 Forbidden` response.
* **Global Error Handler:** Catches all application errors, logs stack traces in development, and returns clean JSON error responses to the client.

---

## 4. Backend Project Structure
```
server/
├── config/
│   ├── db.js                 # MongoDB connection logic
│   └── cloudinary.js         # Cloudinary credentials setup
├── controllers/
│   ├── auth.controller.js     # Auth routines
│   ├── resource.controller.js # File upload & download controllers
│   └── user.controller.js     # Profile and bookmarks logic
├── middleware/
│   ├── authMiddleware.js     # JWT validation checks
│   └── errorHandler.js       # Central Express error handling hook
├── models/
│   ├── User.js               # User profile definitions
│   ├── Resource.js           # File metadata specs
│   └── Comment.js            # Rating and comments schema
└── server.js                 # App entry point, mounts routes
```

---

## 5. Request Lifecycle
Here is what happens when a user requests file details:
1. **Client Action:** The client triggers a request: `GET /api/resources/603fde9a` with the token in the headers.
2. **Server Routing:** The Express app routes the request to `resource.routes.js`.
3. **Session Verification:** `protect` middleware runs, validates the JWT, checks that the user still exists in the database, and adds the user profile to `req.user`.
4. **Execution:** The route handler calls `resourceController.getResourceDetails`.
5. **Mongoose Query:** The controller queries the database:
   ```javascript
   const resource = await Resource.findById(req.params.id)
     .populate('uploadedBy', 'name avatar role');
   ```
6. **Data Output:** If the resource is found, the server returns a `200 OK` JSON response.
7. **Rendering:** The React client receives the data, stops the skeleton animation, and displays the resource details.
