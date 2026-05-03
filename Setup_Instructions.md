# Study Repository — Project Setup Guide

If you are moving this project to a brand-new laptop or handing it over to another developer, here is the exact, step-by-step professional guide to get the platform running smoothly from scratch.

---

## Step 1: Install Required Software
Before touching the code, the new laptop must have these core tools installed:
1. **Node.js (LTS Version):** Download and install the latest LTS (Long Term Support) version from [nodejs.org](https://nodejs.org). *(This includes `npm`, which you need to install packages).*
2. **Git:** Download and install Git from [git-scm.com](https://git-scm.com/). *(If you plan to clone the project from GitHub).*
3. **VS Code:** (Recommended) Download Visual Studio Code to edit the project.

---

## Step 2: Get the Project Files
You have two options to move the code to the new laptop:
* **Option A (GitHub):** Open a terminal on the new laptop and run:
  `git clone <your-github-repo-url>`
* **Option B (USB/Zip):** Simply copy the entire `studyrepo` folder from your current laptop to the new laptop via a pendrive. **Important:** Before copying to a USB, you can delete the `node_modules` folders (inside both `client` and `server`) to make the transfer much faster, as we will reinstall them in the next step anyway.

---

## Step 3: Install All Dependencies
Once the code is on the new laptop, open the `studyrepo` folder in VS Code.

1. Open the VS Code terminal (`Ctrl` + `~`).
2. Run this command in the **root** folder (the main `studyrepo` folder):
   ```bash
   npm run install:all
   ```
   *(This command will automatically go into both the `server` and `client` folders and install all the required packages.)*

---

## Step 4: Setup Environment Variables (.env)
Because `.env` files contain highly sensitive secrets, they are usually not uploaded to GitHub or transferred. You need to recreate them on the new laptop.

### 1. Create Backend Configuration:
* Navigate into the `server` folder.
* Create a new file named `.env`.
* Copy these exact values into it (replace with your actual MongoDB/Cloudinary keys if you have them, or copy them from your old laptop's `.env` file):
  ```env
  NODE_ENV=development
  PORT=5000
  MONGO_URI=mongodb+srv://<your-username>:<your-password>@<your-cluster>.mongodb.net/studyrepo
  JWT_SECRET=super_secret_key_for_jwt_auth_123
  CLOUDINARY_CLOUD_NAME=<your-cloud-name>
  CLOUDINARY_API_KEY=<your-api-key>
  CLOUDINARY_API_SECRET=<your-api-secret>
  FRONTEND_URL=http://localhost:5173
  ```

### 2. Create Frontend Configuration:
* Navigate into the `client` folder.
* Create a new file named `.env`.
* Add this exact line:
  ```env
  VITE_API_URL=http://localhost:5000/api
  ```

---

## Step 5: Run the Platform!
You are now ready to start the servers. Open **two separate terminals** in VS Code.

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```
*(You should see a green success message: "✅ MongoDB connected" and "🚀 Server running on port 5000")*

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```
*(You will see a link like `http://localhost:5173`. Ctrl+Click it to open your browser.)*

The project will now run perfectly on the new laptop exactly as it did on your original machine!
