import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setTimeout(() => setShow(true), 2000);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-sm glass z-50 rounded-2xl p-6 shadow-2xl border border-white/10"
        >
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-white font-semibold flex items-center gap-2">
                <span>🍪</span> Cookie Policy
              </h3>
              <p className="text-sm text-white/70 mt-2">
                We use cookies to enhance your experience, analyze site usage, and serve tailored content. By continuing, you agree to our <a href="/privacy-policy" className="text-ink-400 hover:text-ink-300 underline">Privacy Policy</a>.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={accept} className="btn-primary flex-1 justify-center py-2">
                Accept All
              </button>
              <button onClick={() => setShow(false)} className="btn-ghost flex-1 justify-center py-2 border border-white/10">
                Dismiss
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
