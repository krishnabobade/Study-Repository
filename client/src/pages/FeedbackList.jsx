import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Check, User, Calendar, Trash2, ShieldAlert } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

import { SkeletonList, SkeletonTitle, SkeletonText } from '../components/shared/Skeleton';

export default function FeedbackList() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const { data } = await api.get('/feedback');
      setFeedbacks(data.feedback);
    } catch (err) {
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/feedback/${id}/read`);
      setFeedbacks(prev => prev.map(f => f._id === id ? { ...f, status: 'read' } : f));
      toast.success('Marked as read');
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await api.delete(`/feedback/${confirmDelete._id}`);
      setFeedbacks(prev => prev.filter(f => f._id !== confirmDelete._id));
      toast.success('Feedback deleted successfully');
      setConfirmDelete(null);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to delete feedback';
      toast.error(errMsg);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <SkeletonTitle width="150px" className="h-10" />
        </div>
        <SkeletonList items={4} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-ink-500/10 flex items-center justify-center border border-ink-500/20">
          <MessageSquare size={20} className="text-ink-400" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl text-text-main">User Feedback</h1>
          <p className="text-sm text-text-muted mt-1">Review feedback and bug reports from users.</p>
        </div>
      </div>

      <div className="space-y-4">
        {feedbacks.length === 0 ? (
          <div className="card p-12 text-center flex flex-col items-center border-dashed">
            <MessageSquare size={32} className="text-text-muted/30 mb-4" />
            <p className="text-text-muted">No feedback received yet.</p>
          </div>
        ) : (
          feedbacks.map((f, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={f._id} 
              className={`card p-5 border-l-4 ${f.status === 'unread' ? 'border-l-ink-500 bg-ink-500/5' : 'border-l-border bg-panel'}`}
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 mb-3">
                    {f.user?.avatar ? (
                      <img src={f.user.avatar} className="w-6 h-6 rounded-full object-cover" alt="" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-ink-700 flex items-center justify-center text-[10px] font-bold text-ink-200">
                        {f.user?.name?.[0]}
                      </div>
                    )}
                    <Link to={`/profile/${f.user?._id}`} className="text-sm font-semibold text-text-main hover:text-ink-400 transition-colors">
                      {f.user?.name}
                    </Link>
                    <span className="text-text-muted/40">•</span>
                    <span className="text-xs text-text-muted flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(f.createdAt).toLocaleDateString()} at {new Date(f.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {f.status === 'unread' && (
                      <span className="ml-auto md:ml-2 px-2 py-0.5 rounded-md bg-ink-500/20 text-ink-300 text-[10px] uppercase font-bold tracking-wider">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-[15px] text-text-main/90 leading-relaxed bg-surface/50 p-4 rounded-xl border border-white/5 whitespace-pre-wrap">
                    {f.message}
                  </p>
                </div>
                
                <div className="flex md:flex-col items-stretch md:items-center gap-2 md:self-start mt-2 md:mt-0 shrink-0 w-full md:w-auto">
                  {f.status === 'unread' && (
                    <button 
                      onClick={() => markAsRead(f._id)}
                      className="w-full md:w-auto px-4 py-2.5 min-h-[40px] bg-panel border border-border hover:bg-surface hover:text-ink-400 text-text-muted rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Check size={14} /> Mark as Read
                    </button>
                  )}
                  <button 
                    onClick={() => setConfirmDelete(f)}
                    className="p-2.5 bg-red-500/5 border border-red-500/10 text-red-400 hover:bg-red-500/10 rounded-xl transition-all w-full md:w-auto flex items-center justify-center gap-2 text-sm font-medium min-h-[40px]"
                    title="Delete Feedback"
                  >
                    <Trash2 size={16} />
                    <span className="md:hidden">Delete</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {confirmDelete && (
          <div className="modal-backdrop">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="modal-container"
            >
              <div className="modal-glow-1" />
              <div className="modal-glow-2" />

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4">
                  <ShieldAlert className="text-red-500" size={24} />
                </div>
                <h3 className="text-lg font-bold text-text-main">Delete this feedback?</h3>
                <p className="text-sm text-text-muted mt-2 mb-6 font-normal">
                  You are about to permanently delete feedback submitted by <strong>{confirmDelete.user?.name || 'User'}</strong>. This cannot be reversed.
                </p>
                <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3 w-full relative z-10">
                  <button 
                    onClick={() => setConfirmDelete(null)}
                    className="btn-secondary w-full sm:flex-1 py-2.5 justify-center"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleDelete}
                    className="btn-primary bg-red-600 hover:bg-red-500 w-full sm:flex-1 py-2.5 justify-center text-white border-transparent"
                  >
                    Delete Feedback
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
