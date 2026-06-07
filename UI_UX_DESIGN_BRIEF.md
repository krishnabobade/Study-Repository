# UI/UX Design Brief — Study Repository

This document explains the design philosophy, style guides, and user experience patterns used in Study Repository.

---

## 1. Design Philosophy
Most college portals look outdated, using basic HTML tables, plain fonts, and blue links from the early 2010s. I wanted to design Study Repository to look like a modern, premium web application. 

The goal was to create a space that feels clean, fast, and easy to use, encouraging students to actively share and discover resources. We chose a **Glassmorphism** aesthetic, using subtle borders, blurred panel backgrounds, and soft ambient glows to give the interface visual depth.

---

## 2. Visual Identity & Color System
We designed a dark-themed user interface to reduce eye strain during late-night study sessions. The colors are harmonized using custom variables in [globals.css](file:///c:/Users/KRISHNA%20BOBADE/Downloads/studyrepo/client/src/styles/globals.css):

| Token Name | HSL / HEX Representation | Visual Role |
| :--- | :--- | :--- |
| `--surface` | HSL `244, 28%, 8%` (Dark Space) | Application background wrapper |
| `--panel` | HSL `244, 25%, 12%` (Lighter Indigo-grey) | Cards, menus, and drawer surfaces |
| `--ink-500` | HSL `247, 88%, 65%` (Deep Indigo) | Primary buttons, active routes, and brand logo |
| `--text-main` | HSL `0, 0%, 98%` (Crisp White) | Main page titles and body text |
| `--text-muted`| HSL `244, 12%, 65%` (Cool Grey) | Captions, descriptions, and labels |
| `--border` | HSL `244, 20%, 18%` (Soft Slate) | Panel lines and card borders |

When users toggle **Light Mode**, we invert these variables:
* `--surface` becomes a clean, off-white (`240, 15%, 97%`).
* `--panel` shifts to bright white (`0, 0%, 100%`).
* `--text-main` switches to dark slate (`244, 30%, 15%`).
This toggle uses a smooth `transition-colors duration-300` rule to prevent sudden bright flashes.

---

## 3. Typography Choices
We use a premium font pairing loaded via Google Fonts:
* **Syne / Outfit (Headers):** Used for main page titles (`h1`, `h2`). It has a bold, modern feel that makes sections stand out.
* **DM Sans / Inter (Body text):** Used for navigation links, descriptions, and inputs. It has excellent readability even at small sizes on low-res screens.
* **JetBrains Mono (Code/Metadata):** Used for file stats, semesters, subject codes, and technical logs.

---

## 4. Layout & Responsive Design Approach
The layout adapts to different devices using a mobile-first design:
* **Desktop:** The app features a sticky sidebar on the left and a top header containing search bars, notifications, and profile settings.
* **Mobile Layout (Safe Areas):** On smaller screens, the desktop sidebar transforms into a slide-out drawer menu.
* **Bottom Bar Navigation:** We replace the sidebar with a bottom navigation bar on mobile. The bar uses CSS safe-area variables (`pb-[env(safe-area-inset-bottom)]`) to ensure it sits perfectly above device home indicators on newer iPhones.

---

## 5. UI Components & Micro-Interactions

### 5.1 Card Grids
Instead of lists, resources are displayed in card grids. Each card contains the file's title, subject, a category icon, and its average rating. When hovered, cards lift up slightly (`group-hover:-translate-y-1`) and their borders highlight in deep purple.

### 5.2 Skeleton Loaders
We avoid using full-screen loading spinners, which can feel jarring and slow. Instead, we use animated skeleton loaders that mimic the layout of cards, user lists, and profile statistics. This keeps the page stable and makes data loading feel faster.

```
+--------------------------------------+
| [  Skeleton Avatar  ] [Skeleton Title]|
| [ Skeleton Line 1                   ] |
| [ Skeleton Line 2                   ] |
+--------------------------------------+
```

### 5.3 Modals & Overlays
Modals (such as logout confirmations and announcement popups) use absolute backdrops with a CSS blur (`backdrop-blur-sm`). Framer Motion slides modals in from the bottom on mobile, and scales them up on desktop.

---

## 6. Design Decisions & Reasoning

* **Why we built a custom Theme Toggle:** Late-night study sessions are common. A dark theme helps reduce eye strain, while a light theme is better for daytime outdoor use. Allowing users to toggle this easily improves usability.
* **Why we used a Bottom Bar on Mobile:** The bottom navigation bar keeps core pages within easy reach of the user's thumb, making the app much easier to navigate one-handed on mobile.
* **Why we chose Rounded Borders (rounded-3xl):** Rounded corners give the app a friendly, modern feel that aligns with current SaaS design standards, moving away from outdated, sharp-edged tables.
* **Why we used Profanity Censoring in UI:** Since this is a public college platform, we use helper utilities to censor profanity in usernames and comment threads to keep discussions professional.
