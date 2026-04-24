const fs = require('fs');
const path = require('path');

const globalsPath = path.join(__dirname, 'src', 'styles', 'globals.css');
const tailwindPath = path.join(__dirname, 'tailwind.config.js');

let globals = fs.readFileSync(globalsPath, 'utf8');
globals = globals.replace(/--ink-50:.*?;/g, '--ink-50: 245 244 255;');
globals = globals.replace(/--ink-100:.*?;/g, '--ink-100: 236 235 255;');
globals = globals.replace(/--ink-200:.*?;/g, '--ink-200: 221 217 255;');
globals = globals.replace(/--ink-300:.*?;/g, '--ink-300: 194 186 255;');
globals = globals.replace(/--ink-400:.*?;/g, '--ink-400: 161 145 255;');
globals = globals.replace(/--ink-500:.*?;/g, '--ink-500: 132 103 255;');
globals = globals.replace(/--ink-600:.*?;/g, '--ink-600: 101 88 245;');
globals = globals.replace(/--ink-700:.*?;/g, '--ink-700: 84 71 225;');
globals = globals.replace(/--ink-800:.*?;/g, '--ink-800: 70 57 185;');
globals = globals.replace(/--ink-900:.*?;/g, '--ink-900: 60 50 149;');
globals = globals.replace(/--ink-950:.*?;/g, '--ink-950: 36 29 99;');

// But wait, the above replaced BOTH dark and light mode.
// Let's rewrite the specific sections.
fs.writeFileSync(globalsPath, `
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --surface: #0f0e17;
  --panel: #16141f;
  --card: #1e1b2e;
  --border: #2a2740;
  --text-main: #ffffff;
  --text-muted: rgba(255, 255, 255, 0.6);
  --ink-primary: #6558f5;
  --ink-secondary: #8480fc;
  --ink-50: 245 244 255;
  --ink-100: 236 235 255;
  --ink-200: 221 217 255;
  --ink-300: 194 186 255;
  --ink-400: 161 145 255;
  --ink-500: 132 103 255;
  --ink-600: 101 88 245;
  --ink-700: 84 71 225;
  --ink-800: 70 57 185;
  --ink-900: 60 50 149;
  --ink-950: 36 29 99;
  --glass-bg: rgba(30, 27, 46, 0.7);
  --glass-border: rgba(255, 255, 255, 0.06);
}

.light-mode {
  --surface: #F8FAFC;
  --panel: #FFFFFF;
  --card: #FFFFFF;
  --border: #E2E8F0;
  --text-main: #0F172A;
  --text-muted: #64748B;
  --ink-primary: #007AFF;
  --ink-secondary: #5AC8FA;
  --ink-50: 245 249 255;
  --ink-100: 230 240 255;
  --ink-200: 204 224 255;
  --ink-300: 153 194 255;
  --ink-400: 102 163 255;
  --ink-500: 0 122 255;
  --ink-600: 0 98 204;
  --ink-700: 0 77 153;
  --ink-800: 0 54 102;
  --ink-900: 0 34 64;
  --ink-950: 0 18 34;
  --glass-bg: rgba(255, 255, 255, 0.8);
  --glass-border: rgba(0, 0, 0, 0.05);
}

@layer base {
  *, *::before, *::after { box-sizing: border-box; }

  html { scroll-behavior: smooth; }

  body {
    background-color: var(--surface);
    color: var(--text-main);
    @apply font-sans antialiased;
    min-height: 100vh;
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { @apply bg-border rounded-full; }
  ::-webkit-scrollbar-thumb:hover { @apply bg-ink-700; }

  ::selection { @apply bg-ink-500/40 text-text-main; }
}

@layer components {
  .glass {
    background: var(--glass-bg);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid var(--glass-border);
  }

  .glass-light {
    background: rgba(255,255,255,0.04);
    backdrop-filter: blur(12px);
    border: 1px solid var(--glass-border);
  }

  .shimmer-bg {
    background: linear-gradient(90deg,
      rgba(255,255,255,0.03) 0%,
      rgba(255,255,255,0.08) 50%,
      rgba(255,255,255,0.03) 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }

  .btn-primary {
    @apply inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
           bg-ink-500 hover:bg-ink-400 active:bg-ink-600
           text-white font-medium text-sm
           transition-all duration-200
           disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .btn-ghost {
    @apply inline-flex items-center gap-2 px-4 py-2 rounded-xl
           text-text-muted hover:text-text-main hover:bg-card
           font-medium text-sm transition-all duration-200;
  }

  .btn-danger {
    @apply inline-flex items-center gap-2 px-4 py-2 rounded-xl
           bg-red-500/10 hover:bg-red-500/20 text-red-400
           font-medium text-sm transition-all duration-200;
  }

  .input {
    @apply w-full px-4 py-3 rounded-xl
    bg-card border border-border
    text-text-main placeholder-text-muted
    focus:outline-none focus:border-ink-500 focus:ring-1 focus:ring-ink-500/50
    transition-all duration-200 text-sm;
  }

  .select {
    @apply input appearance-none cursor-pointer;
  }

  .select option,
  select option,
  optgroup {
    @apply text-text-main bg-card;
  }

  .card {
    @apply bg-card border border-border rounded-2xl;
  }

  .badge {
    @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
  }
}

/* Page transition wrapper */
.page-wrapper {
  animation: fadeUp 0.4s ease both;
}

/* Noise overlay for depth */
.noise::after {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 9999;
  opacity: 0.4;
}

/* Hide Spline Watermark Logo */
a[href*="splinetool"], a[href*="spline.design"], #logo {
  display: none !important;
  opacity: 0 !important;
  visibility: hidden !important;
  pointer-events: none !important;
}
`);

let tailwind = fs.readFileSync(tailwindPath, 'utf8');
tailwind = tailwind.replace(/ink: {[\s\S]*?},/, `ink: {
          50:  'rgb(var(--ink-50) / <alpha-value>)',
          100: 'rgb(var(--ink-100) / <alpha-value>)',
          200: 'rgb(var(--ink-200) / <alpha-value>)',
          300: 'rgb(var(--ink-300) / <alpha-value>)',
          400: 'rgb(var(--ink-400) / <alpha-value>)',
          500: 'rgb(var(--ink-500) / <alpha-value>)',
          600: 'rgb(var(--ink-600) / <alpha-value>)',
          700: 'rgb(var(--ink-700) / <alpha-value>)',
          800: 'rgb(var(--ink-800) / <alpha-value>)',
          900: 'rgb(var(--ink-900) / <alpha-value>)',
          950: 'rgb(var(--ink-950) / <alpha-value>)',
        },`);
fs.writeFileSync(tailwindPath, tailwind);
