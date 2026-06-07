import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    
    setLoading(true);
    try {
      await api.post('/feedback', { message: feedback });
      setIsOpen(false);
      setFeedback('');
      toast.success('Thanks for your feedback!');
    } catch (err) {
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-[84px] lg:bottom-6 right-4 lg:right-6 z-40 bg-ink-500 hover:bg-ink-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        title="Send Feedback"
      >
        <MessageSquare size={20} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-[140px] lg:bottom-20 right-4 lg:right-6 z-50 w-[calc(100vw-32px)] sm:w-80 max-w-sm bg-panel border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="bg-ink-500 p-4 flex items-center justify-between">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <MessageSquare size={16} /> Send Feedback
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4">
              <p className="text-xs text-text-muted mb-3">
                How can we improve the platform? Found a bug? Let us know!
              </p>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="I noticed that..."
                rows={4}
                required
                className="input px-3 py-2 resize-none mb-3"
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-2.5 text-sm"
              >
                {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send size={14} /> Send to team</>}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
