# How to Deploy the Platform

If you're reading this, you're probably trying to get this project live on the internet so actual people can use it. Deploying full-stack apps can be annoying with all the moving parts, so I wrote down exactly how we do it here.

We usually split the deployment: the frontend goes to Vercel (because it's basically magic for React apps), and the backend goes to Render or Fly.io (since they have good free/cheap tiers for Node APIs).

## 1. Setting up the Database (MongoDB Atlas)
Before you deploy the code, you need a database living on the cloud.
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and make a free cluster.
2. In the Network Access tab, allow access from anywhere (`0.0.0.0/0`). We have to do this because serverless hosts like Render change their IP addresses constantly.
3. Grab your connection string (it looks like `mongodb+srv://...`). Save this somewhere safe.

## 2. Setting up File Storage (Cloudinary)
Since we let faculty upload PDFs and images, we need a place to put them that isn't our web server.
1. Make a free [Cloudinary](https://cloudinary.com/) account.
2. Go to the dashboard and copy your Cloud Name, API Key, and API Secret.

## 3. Deploying the Backend
I recommend using [Render](https://render.com) for the Node.js API because it's pretty straightforward.
1. Connect your GitHub account to Render and create a new "Web Service".
2. Pick this repository.
3. For the **Root Directory**, type `server`.
4. **Build Command**: `npm install`
5. **Start Command**: `npm start` (Make sure your `package.json` in the server folder has a start script pointing to `node server.js`).
6. **Environment Variables**: This is the most important part. Copy all the variables from your local `.env` file into Render's environment variable section. Make sure `NODE_ENV` is set to `production`.

Once Render finishes building, it'll give you a live URL (something like `https://studyrepo-api.onrender.com`). Copy that, you'll need it for the frontend!

## 4. Deploying the Frontend
[Vercel](https://vercel.com) is the easiest way to host the React/Vite frontend.
1. Log into Vercel and import this GitHub repo.
2. For the **Root Directory**, pick `client`.
3. Vercel is smart and usually guesses the build commands, but just in case:
   - Build command: `npm run build`
   - Output directory: `dist`
4. **Environment Variables**: Add `VITE_API_URL` and set its value to the live backend URL you got from Render (don't forget to add `/api` to the end if your routes need it).
5. Hit Deploy.

## 5. Final Checks
Once Vercel gives you the live URL for the frontend:
1. Go back to Render (your backend) and make sure you add the Vercel URL to your CORS whitelist in `server.js` (if you hardcoded it).
2. Open the live site and try to log in.
3. Try uploading a test file to make sure Cloudinary is linked up right.

If something breaks, check the logs in Render or Vercel. 99% of the time, it's just a missing environment variable or a trailing slash in a URL. Good luck!
