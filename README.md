# MIT-WPU Study Repository

Hey! Welcome to the Study Repository. 

This project started because we noticed how hard it is to track down good notes, previous year question papers, and trusted study materials around campus. Too much time gets wasted asking around in WhatsApp groups just to find out someone lost the PDF.

So, we built this platform. It's a dedicated place for MIT-WPU students and faculty to upload, find, and organize academic materials. It's built to be fast, secure, and really easy to use.

## What it actually does

- **MIT-WPU Only**: You have to log in with an `@mitwpu.edu.in` email address. This keeps the platform focused on our actual students and stops spam accounts.
- **Smart Uploads**: Right now, only verified faculty and teachers can upload documents. This helps us ensure that the notes and materials on here are actually correct and relevant to the syllabus.
- **Preview Files**: You can preview most PDFs and images right in your browser without having to download everything first to see if it's what you need.
- **Clean Interface**: We spent a lot of time on the UI. It has a nice dark/light mode toggle, it works great on mobile phones, and we added skeleton loaders so the screen doesn't jump around while things load.

## Tech Stack
If you're curious about how it's built (or want to run it yourself):
- **Frontend**: React 18 using Vite, styled with Tailwind CSS v3. We used Framer Motion for some of the smooth page transitions, and Zustand for state management.
- **Backend**: Standard Node.js and Express.js setup.
- **Database**: MongoDB (via Mongoose).
- **Storage**: Cloudinary handles the actual file storage for the PDFs and images.

## Getting it running locally

If you want to clone this and play around with the code, here's how to get it running on your machine.

**What you need first:**
- Node.js (version 18 or higher)
- MongoDB installed locally, or an Atlas cluster URL
- A Cloudinary account (it's free, you just need the API keys)

**1. Grab the code**
```bash
git clone https://github.com/krishnabobade/StudyRepository.git
cd StudyRepository
```

**2. Set up the backend**
```bash
cd server
npm install
```
You'll need to create a `.env` file in the `server` folder. Copy the `.env.example` file and fill in your details:
```env
PORT=5000
MONGO_URI=your_mongodb_uri_here
JWT_SECRET=make_up_a_secret_key
ADMIN_EMAIL=your_admin_email@mitwpu.edu.in
SEED_ADMIN_PASSWORD=your_admin_password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```
Once that's done, start the server:
```bash
npm run dev
```

**3. Set up the frontend**
Open a new terminal window and go to the `client` folder:
```bash
cd client
npm install
```
Create another `.env` file inside the `client` folder:
```env
VITE_API_URL=http://localhost:5000/api
```
Run the frontend:
```bash
npm run dev
```

That's it! You should be able to open `http://localhost:5173` in your browser and see the app running.

## Contributing
If you're a student here and want to help make this better, we'd love your help! Whether it's fixing a UI bug, speeding up a query, or writing better docs, feel free to open a Pull Request. Check out `CONTRIBUTING.md` for a quick guide on how we handle things.

## Support
If something is completely broken or you found a major bug, you can reach out directly at krishnabobade1313@gmail.com.

---
*Built with coffee and late nights by MIT-WPU students.*
