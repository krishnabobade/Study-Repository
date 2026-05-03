import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Check, User, Calendar } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

import { SkeletonList, SkeletonTitle, SkeletonText } from '../components/shared/Skeleton';

export default function FeedbackList() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <SkeletonTitle width="150px" className="h-10" />
        </div>
        <SkeletonList items={4} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
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
                  <div className="flex items-center gap-2 mb-3">
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
                {f.status === 'unread' && (
                  <div className="md:self-start mt-2 md:mt-0">
                    <button 
                      onClick={() => markAsRead(f._id)}
                      className="w-full md:w-auto px-4 py-2 bg-panel border border-border hover:bg-surface hover:text-ink-400 text-text-muted rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Check size={14} /> Mark as Read
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
