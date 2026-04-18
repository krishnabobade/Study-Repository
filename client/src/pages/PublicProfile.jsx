import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Send, Award, Calendar, BookOpen, GraduationCap, ArrowLeft, ShieldCheck, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import useAuthStore from '../store/authStore'
import { Skeleton, Stars, timeAgo } from '../components/shared/utils'

export default function PublicProfile() {
  const { id } = useParams()
  const { user: currentUser } = useAuthStore()
  const [profile, setProfile] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get(`/auth/user/${id}`),
      api.get(`/users/${id}/reviews`)
    ]).then(([u, r]) => {
      setProfile(u.data.user)
      setReviews(r.data.reviews)
    }).catch(() => {
      toast.error('Failed to load profile')
    }).finally(() => setLoading(false))
  }, [id])

  const handleReview = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return toast.error('Please add a comment')
    setSubmitting(true)
    try {
      const { data } = await api.post(`/users/${id}/reviews`, { rating, comment })
      setReviews(prev => [data.review, ...prev])
      setComment('')
      toast.success('Review submitted successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <Skeleton className="h-40 w-full rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
        <div className="md:col-span-2 space-y-6">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  )

  if (!profile) return (
    <div className="flex flex-col items-center justify-center py-20">
      <p className="text-white/40 mb-4 font-display text-lg">Student profile not found</p>
      <Link to="/dashboard" className="btn-primary">Back to Home</Link>
    </div>
  )

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-ink-500/5 blur-[120px] -z-10 pointer-events-none" />
      
      <Link to={-1} className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors">
        <ArrowLeft size={16} /> Back
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: User Card */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-6 text-center">
            <div className="relative inline-block mx-auto mb-4">
              <div className="w-24 h-24 rounded-3xl bg-ink-700 flex items-center justify-center overflow-hidden ring-4 ring-border shadow-2xl">
                {profile.avatar ? (
                  <img src={profile.avatar} className="w-full h-full object-cover" alt="" />
                ) : (
                  <span className="text-4xl font-black text-ink-300">{profile.name?.[0].toUpperCase()}</span>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center border-4 border-card text-white">
                <ShieldCheck size={16} />
              </div>
            </div>
            
            <h1 className="font-display font-bold text-2xl text-white mb-1">{profile.name}</h1>
            <p className="text-ink-400 font-semibold text-xs uppercase tracking-widest mb-4">
              {profile.role === 'student' ? 'Verified Student' : 'Instructor'}
            </p>

            <div className="space-y-3 py-4 border-t border-white/5">
              <div className="flex items-center gap-3 text-white/60 text-sm">
                <GraduationCap size={16} className="text-ink-400" />
                <span className="truncate">{profile.course || 'Not specified'}</span>
              </div>
              <div className="flex items-center gap-3 text-white/60 text-sm">
                <Mail size={16} className="text-ink-400" />
                <span className="truncate text-xs">{profile.email}</span>
              </div>
              <div className="flex items-center gap-3 text-white/60 text-sm">
                <Calendar size={16} className="text-ink-400" />
                <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-2">
              <div className="p-3 rounded-2xl bg-white/[0.03]">
                <p className="text-xs text-white/30 mb-1">Reputation</p>
                <div className="flex items-center justify-center gap-1 text-ink-400 font-bold">
                  <Star size={14} fill="currentColor" />
                  {profile.avgRating > 0 ? profile.avgRating.toFixed(1) : 'N/A'}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.03]">
                <p className="text-xs text-white/30 mb-1">Credits</p>
                <div className="flex items-center justify-center gap-1 text-ink-300 font-bold">
                  <Award size={14} />
                  {profile.credits}
                </div>
              </div>
            </div>
          </motion.div>

          {profile.bio && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} 
              className="card p-5">
              <h3 className="text-sm font-semibold text-white/60 mb-3 uppercase tracking-wider">About</h3>
              <p className="text-sm text-white/50 leading-relaxed font-medium">"{profile.bio}"</p>
            </motion.div>
          )}
        </div>

        {/* Right Column: Reviews & Statistics */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
             <div className="card p-4 flex flex-col items-center justify-center text-center bg-gradient-to-br from-ink-500/10 to-transparent">
                <p className="text-2xl font-black text-white">{profile.totalUploads}</p>
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mt-1">uploads</p>
             </div>
             <div className="card p-4 flex flex-col items-center justify-center text-center bg-gradient-to-br from-cyan-500/10 to-transparent">
                <p className="text-2xl font-black text-white">{profile.totalDownloads}</p>
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mt-1">downloads</p>
             </div>
             <div className="card p-4 flex flex-col items-center justify-center text-center col-span-2 sm:col-span-1 bg-gradient-to-br from-purple-500/10 to-transparent">
                <p className="text-2xl font-black text-white">{profile.ratingCount}</p>
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mt-1">peer reviews</p>
             </div>
          </div>

          {/* Submit Review */}
          {currentUser?._id !== profile._id && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
              <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                <Send size={18} className="text-ink-400" /> Evaluate Student
              </h3>
              <form onSubmit={handleReview} className="space-y-4">
                <div>
                  <label className="text-xs text-white/40 block mb-2 font-medium uppercase tracking-wider">Reliability Score</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <button key={i} type="button" onClick={() => setRating(i)} 
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                          i <= rating ? 'bg-ink-500 text-white shadow-lg shadow-ink-500/20 scale-110' : 'bg-white/5 text-white/20'
                        }`}>
                        <Star size={18} fill={i <= rating ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/40 block mb-2 font-medium uppercase tracking-wider">Peer Feedback</label>
                  <textarea 
                    className="input h-24 resize-none leading-relaxed" 
                    placeholder="Provide constructive feedback about this student's contributions, resources, or collaboration…"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>
                <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
                  {submitting ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : 'Submit Recognition'}
                </button>
              </form>
            </motion.div>
          )}

          {/* Review List */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-white flex items-center gap-2">
              <BookOpen size={18} className="text-ink-400" /> Recent Recognition
            </h3>
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {reviews.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10 card bg-white/[0.01]">
                    <p className="text-white/30 text-sm italic">No feedback received for this student yet.</p>
                  </motion.div>
                ) : (
                  reviews.map((r, i) => (
                    <motion.div 
                      key={r._id} 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: i * 0.05 }}
                      className="card p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden">
                            {r.reviewer?.avatar ? (
                              <img src={r.reviewer.avatar} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <span className="text-xs font-bold text-ink-300">{r.reviewer?.name?.[0]}</span>
                            )}
                          </div>
                          <div>
                            <Link to={`/profile/${r.reviewer?._id}`} className="text-sm font-semibold text-white hover:text-ink-400 transition-colors">
                              {r.reviewer?.name}
                            </Link>
                            <p className="text-[10px] text-white/40 uppercase font-bold">{timeAgo(r.createdAt)}</p>
                          </div>
                        </div>
                        <Stars rating={r.rating} size={12} />
                      </div>
                      <p className="text-sm text-white/60 leading-relaxed italic pr-4">
                        "{r.comment}"
                      </p>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
