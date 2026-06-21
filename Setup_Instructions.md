# Local Setup Guide

If you're taking over this project, moving to a new laptop, or just want to run it yourself to see how it works, here is the exact step-by-step process. I wrote this so you don't have to guess what commands to run.

## 1. What you need installed first
Before we touch any code, make sure you have these installed:
- **Node.js**: Grab the latest LTS version from their website. This gives you `npm` which we need to install the project dependencies.
- **Git**: If you plan to clone the repo from GitHub.
- **VS Code**: You can use any editor, but VS Code makes life easier.

## 2. Get the code
Open your terminal and clone the repository:
```bash
git clone https://github.com/krishnabobade/StudyRepository.git
```
*(If someone just handed you a zip file or pendrive with the code, you can skip this and just extract the folder).*

## 3. Install the dependencies
We need to install the NPM packages for both the backend and frontend.

Open the `StudyRepository` folder in VS Code, open the terminal, and run:
```bash
npm run install:all
```
This is a custom script I added to `package.json` that will automatically go into both the `server` and `client` folders and install everything for you. Grab some water, it might take a minute.

## 4. Setting up Environment Variables (.env)
We don't upload `.env` files to GitHub because they contain private API keys and database passwords. You have to create them manually.

**For the Backend:**
1. Go into the `server` folder.
2. Create a new file called `.env`.
3. Paste this in and replace the placeholder text with your actual keys:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/studyrepo
JWT_SECRET=put_a_long_random_string_here
ADMIN_EMAIL=your_admin_email@mitwpu.edu.in
SEED_ADMIN_PASSWORD=your_admin_password
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
FRONTEND_URL=http://localhost:5173
```

**For the Frontend:**
1. Go into the `client` folder.
2. Create a new file called `.env`.
3. Paste this line:
```env
VITE_API_URL=http://localhost:5000/api
```

## 5. Start the servers!
You need both the frontend and backend running at the same time to use the app.

Open two separate terminal tabs in VS Code.

**In Tab 1 (Backend):**
```bash
cd server
npm run dev
```
Wait a second until you see it say MongoDB connected.

**In Tab 2 (Frontend):**
```bash
cd client
npm run dev
```
It should give you a local link (usually `http://localhost:5173`). Click it, and you're good to go!

If you run into weird errors, double-check that your MongoDB IP whitelist allows your current connection, and make sure you didn't accidentally leave a typo in the `.env` files.
