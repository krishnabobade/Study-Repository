# Changelog

This is where we keep track of what's changing in the project. We try to write this so you can actually understand what we did, rather than just dumping raw git commits.

## [1.0.0] - Production Launch Prep!
*We finally did it! The platform is officially out of the testing phase and ready for real users.*

**What we built:**
- Completely overhauled the UI so it looks amazing on mobile phones and ultra-wide monitors. No more weirdly stretched cards on your iPad.
- Re-wrote the navigation so the bottom bar respects iOS/Android safe areas (no more overlapping with the iPhone home bar!).
- Added a proper dark/light mode toggle that actually remembers your preference.
- Built a secure login system that strictly checks for `@mitwpu.edu.in` emails. If you don't have the college email, you can't get in.
- Hooked up Cloudinary so faculty can upload PDFs and image notes without crashing our servers.
- Stripped out all the random `console.log` statements we left in during development. The console is finally clean!

**Bug Fixes:**
- Fixed a super annoying issue where the action buttons on the resource detail page would overflow off the screen on small phones.
- Cleaned up the git conflict markers that got accidentally pushed into the `README.md` (oops).
- Made sure the loading skeletons actually match the shape of the content so the page doesn't bounce around when the data finally loads.

---
*Older updates from the initial prototyping phase aren't tracked here, but feel free to dig through the git history if you're really bored!*
