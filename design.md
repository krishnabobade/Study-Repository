# Platform Design & Architecture

When we started building the Study Repository, we wanted to make sure it didn't look like a typical boring college portal. We wanted it to feel like an app you actually enjoy using—something modern, fast, and pretty. 

Here is a quick overview of how we designed the system and why we made certain technical choices.

## The UI/UX Vibe
We went with a "glassmorphism" aesthetic. Lots of subtle blurs, soft shadows, and clean gradients. 

- **Colors:** We mapped out a custom color palette in Tailwind. Instead of generic reds and blues, we use specific `ink` shades that look professional but still vibrant.
- **Dark Mode:** We didn't just invert colors for dark mode. We hand-picked surface and panel colors that reduce eye strain for those late-night study sessions.
- **Animations:** We heavily rely on `framer-motion` for page transitions. When you open a modal or click a button, things slide and fade naturally. It makes the app feel "alive" without being distracting.
- **Skeletons:** Nobody likes staring at a blank white screen while the Wi-Fi struggles to load a PDF. We use skeleton loaders everywhere so you immediately see the shape of the page before the data actually arrives.

## Frontend Architecture (React)
The frontend is built with React 18 and Vite.
- **State Management:** We used Zustand instead of Redux. It's way lighter, easier to read, and we didn't need all the crazy boilerplate that Redux forces you to write. We mostly use it for storing the user's login session and theme preference.
- **Routing:** Standard React Router. 
- **Styling:** Tailwind CSS all the way. It lets us build responsive grids insanely fast without having to jump between `.jsx` and `.css` files constantly.
- **Mobile First:** We built the layouts starting from a mobile phone size and scaled up. We also added support for iOS/Android safe areas so the bottom navigation doesn't get squished by the home bar.

## Backend Architecture (Node/Express)
We wanted the backend to be simple and easy to maintain. 
- **The API:** It's a standard REST API built with Express.js. We kept controllers and routes in separate folders so it's easy to figure out where things are.
- **Database:** MongoDB (using Mongoose). Since documents and study materials have a lot of weird unstructured data (like tags, random subjects, and upvotes), a NoSQL database made the most sense.
- **Authentication:** We use JWT (JSON Web Tokens). When you log in, the server hands you a token, and your browser saves it in local storage. We also wrote middleware to make sure only `@mitwpu.edu.in` emails are allowed to register.

## File Uploads (The hard part)
Handling PDFs and images can crash a small server really fast. 
Instead of saving files directly to our database, we pipe them straight to Cloudinary using `multer`. Cloudinary handles all the storage, resizing, and delivery through their CDN, which keeps our backend super lightweight and fast.

## What's Next?
Right now, the architecture handles everything we need. If the platform blows up and we get thousands of concurrent users during exam week, we might need to add Redis for caching or move the search feature to something like ElasticSearch. But for now, this setup is solid, easy to deploy, and cheap to run!
