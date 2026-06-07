import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

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

  const reject = () => {
    localStorage.setItem('cookie_consent', 'rejected');
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-4 lg:p-6"
        >
          <div className="max-w-6xl mx-auto bg-panel/90 backdrop-blur-xl border border-border shadow-[0_-10px_40px_rgba(0,0,0,0.3)] rounded-2xl p-4 lg:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-ink-500/10 flex items-center justify-center shrink-0">
                <span className="text-xl">🍪</span>
              </div>
              <p className="text-sm text-text-main leading-relaxed text-center md:text-left">
                We use cookies to improve your experience and analyze our traffic. By using our site, you agree to our <Link to="/privacy-policy" className="text-ink-400 hover:underline">Privacy Policy</Link>.
              </p>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button 
                onClick={accept} 
                className="flex-1 md:flex-none px-6 py-2.5 bg-ink-500 hover:bg-ink-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-ink-500/20"
              >
                Accept Cookies
              </button>
              <button 
                onClick={reject} 
                className="flex-1 md:flex-none px-6 py-2.5 bg-surface border border-border hover:bg-panel text-text-main text-sm font-semibold rounded-xl transition-all"
              >
                Reject Cookies
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
