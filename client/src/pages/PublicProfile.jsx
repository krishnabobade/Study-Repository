import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Calendar, BookOpen, Download, LayoutDashboard, ChevronLeft, Award, FileText, ThumbsUp, ThumbsDown, Star, Trash2 } from 'lucide-react'
import api from '../services/api'
import { timeAgo } from '../components/shared/utils'
import { SkeletonAvatar, SkeletonTitle, SkeletonText, SkeletonCard } from '../components/shared/Skeleton'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

export default function PublicProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [activity, setActivity] = useState([])
  const [myInteraction, setMyInteraction] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get(`/users/${id}/profile`)
        setProfile(data.profile)
        setActivity(data.recentActivity || [])
        setMyInteraction(data.myInteraction || null)
      } catch (err) {
        // Silent fail or handle error
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [id])

  const handleInteract = async (action, rating = undefined) => {
    if (!user) return toast.error('Login required')
    try {
      const { data } = await api.post(`/users/${id}/interact`, { action, rating })
      setMyInteraction(data.myInteraction)
      setProfile(prev => ({ ...prev, ...data.stats }))
    } catch(err) {
      toast.error(err.response?.data?.message || 'Interaction failed')
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="card p-6 md:p-8 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
            <SkeletonAvatar size={100} />
            <div className="flex-1 text-center md:text-left space-y-3 w-full">
              <SkeletonTitle width="50%" />
              <SkeletonText lines={2} />
              <div className="flex justify-center md:justify-start gap-4 mt-4">
                <SkeletonText lines={1} className="w-24" />
                <SkeletonText lines={1} className="w-24" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full text-center">
        <div className="w-16 h-16 bg-panel border border-border rounded-full flex items-center justify-center mb-4">
          <User size={32} className="text-text-muted/20" />
        </div>
        <h2 className="text-xl font-display font-bold text-text-main mb-2">User Not Found</h2>
        <p className="text-sm text-text-muted mb-6">This profile doesn't exist or is unavailable.</p>
        <button onClick={() => navigate(-1)} className="text-sm text-ink-400 hover:text-ink-300 transition-colors flex items-center gap-1">
          <ChevronLeft size={16} /> Go Back
        </button>
      </div>
    )
  }

  const avatar = profile.avatar 
    ? <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
    : <span className="text-3xl font-display font-semibold text-ink-200">{profile.name?.[0]?.toUpperCase()}</span>

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-text-main transition-colors mb-2 group">
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="card p-6 md:p-8 relative overflow-hidden"
      >
        {/* Subtle background glow mapping */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-ink-500/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left relative z-10">
          <div className="w-24 h-24 rounded-[32px] bg-ink-800 flex items-center justify-center shrink-0 shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden ring-4 ring-ink-500/10">
            {avatar}
          </div>
          
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3 justify-center md:justify-start">
              <h1 className="text-[28px] leading-none font-display font-bold text-text-main tracking-tight">{profile.name}</h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] uppercase tracking-wider rounded-xl font-black
                ${profile.role === 'teacher' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 
                  profile.role === 'admin' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
                  'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                {profile.role}
              </span>
            </div>

            <p className="text-[15px] leading-relaxed text-text-muted mb-6 max-w-2xl mx-auto md:mx-0 font-medium">
              {profile.bio || "This user hasn't added a bio yet."}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <div className="flex items-center gap-2 text-sm font-medium text-text-muted bg-panel border border-border py-2 px-3.5 rounded-xl shadow-inner">
                <Calendar size={15} className="text-ink-400" />
                Joined {new Date(profile.joined || Date.now()).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </div>
              {(profile.course || profile.semester) && (
                <div className="flex items-center gap-2 text-sm font-medium text-text-muted bg-panel border border-border py-2 px-3.5 rounded-xl shadow-inner">
                  <LayoutDashboard size={15} className="text-ink-400" />
                  {profile.course} {profile.semester ? `• Semester ${profile.semester}` : ''}
                </div>
              )}
            </div>

            {/* Interaction Buttons */}
            {user && user._id !== id && (
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-5">
                <button onClick={() => handleInteract(myInteraction?.action === 'like' ? 'none' : 'like')} className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors border ${myInteraction?.action === 'like' ? 'bg-ink-500/20 border-ink-500/30 text-ink-300' : 'bg-panel border-border text-text-muted hover:bg-panel/80'}`}>
                  <ThumbsUp size={16} className={myInteraction?.action === 'like' ? "fill-ink-500" : ""} />
                  <span className="text-sm font-semibold">Like</span>
                </button>
                <button onClick={() => handleInteract(myInteraction?.action === 'dislike' ? 'none' : 'dislike')} className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors border ${myInteraction?.action === 'dislike' ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-panel border-border text-text-muted hover:bg-panel/80'}`}>
                  <ThumbsDown size={16} className={myInteraction?.action === 'dislike' ? "fill-red-500" : ""} />
                  <span className="text-sm font-semibold">Dislike</span>
                </button>
                <div className="flex bg-panel px-3 py-2 rounded-xl border border-border items-center gap-1.5 ml-1">
                  {[1,2,3,4,5].map(star => (
                    <Star key={star} onClick={() => handleInteract(undefined, star)} className={`cursor-pointer transition-colors ${myInteraction?.rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-text-muted hover:text-yellow-400/50'}`} size={16} />
                  ))}
                </div>
                {user.role === 'super_admin' && (
                  <button 
                    onClick={async () => {
                       if (!window.confirm('Are you sure you want to permanently delete this user account? This cannot be undone.')) return;
                       try {
                         await api.delete(`/users/${id}`);
                         import('react-hot-toast').then(t => t.default.success('User deleted successfully.'));
                         navigate('/dashboard');
                       } catch (err) {
                         import('react-hot-toast').then(t => t.default.error(err.response?.data?.message || 'Failed to delete user.'));
                       }
                    }}
                    className="px-4 py-2 rounded-xl flex items-center gap-2 transition-colors border bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20 md:ml-auto"
                  >
                    <Trash2 size={16} />
                    <span className="text-sm font-semibold">Delete User</span>
                  </button>
                )}
              </div>
            )}

          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mt-8 pt-8 relative z-10 border-t border-white/[0.08]">
          <div className="bg-panel/50 border border-border rounded-2xl p-5 text-center flex flex-col items-center justify-center shadow-sm">
            <BookOpen size={22} className="text-ink-400 mb-3 opacity-90" />
            <p className="text-[26px] leading-none font-display font-bold text-text-main mb-2">{profile.totalUploads || 0}</p>
            <p className="text-[11px] text-text-muted uppercase tracking-widest font-bold">Contributions</p>
          </div>
          <div className="bg-panel/50 border border-border rounded-2xl p-5 text-center flex flex-col items-center justify-center shadow-sm">
            <Download size={22} className="text-ink-400 mb-3 opacity-90" />
            <p className="text-[26px] leading-none font-display font-bold text-text-main mb-2">{profile.totalDownloads || 0}</p>
            <p className="text-[11px] text-text-muted uppercase tracking-widest font-bold">Downloads</p>
          </div>
          <div className="bg-panel/50 border border-border rounded-2xl p-5 text-center flex flex-col items-center justify-center shadow-sm">
            <ThumbsUp size={22} className="text-ink-400 mb-3 opacity-90" />
            <p className="text-[26px] leading-none font-display font-bold text-text-main mb-2">{(profile.totalLikes || 0) + (profile.documentLikes || 0)}</p>
            <p className="text-[11px] text-text-muted uppercase tracking-widest font-bold">Total Likes</p>
          </div>
          <div className="bg-panel/50 border border-border rounded-2xl p-5 text-center flex flex-col items-center justify-center shadow-sm">
            <ThumbsDown size={22} className="text-red-400 mb-3 opacity-90" />
            <p className="text-[26px] leading-none font-display font-bold text-text-main mb-2">{(profile.totalDislikes || 0) + (profile.documentDislikes || 0)}</p>
            <p className="text-[11px] text-text-muted uppercase tracking-widest font-bold">Dislikes</p>
          </div>
          <div className="bg-panel/50 border border-border rounded-2xl p-5 text-center flex flex-col items-center justify-center shadow-sm">
            <Star size={22} className="text-yellow-400 mb-3 opacity-90" />
            <p className="text-[26px] leading-none font-display font-bold text-text-main mb-2">{profile.avgRating || 0}</p>
            <p className="text-[11px] text-text-muted uppercase tracking-widest font-bold">{profile.ratingCount || 0} Ratings</p>
          </div>
        </div>
      </motion.div>

      {profile.role !== 'student' && activity.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300, delay: 0.1 }}
          className="space-y-4 relative"
        >
          <div className="flex items-center gap-2 px-2 mt-4">
            <div className="w-1.5 h-6 bg-ink-500 rounded-full" />
            <h2 className="text-[19px] font-display font-bold text-text-main">Recent Uploads</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activity.map(item => (
              <Link key={item._id} to={`/resources/${item._id}`} className="card p-4 hover:border-ink-500/30 transition-all duration-300 group hover:-translate-y-1 shadow-lg hover:shadow-ink-500/10">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-[14px] bg-ink-500/10 flex items-center justify-center group-hover:bg-ink-500/20 transition-colors shrink-0 border border-ink-500/10">
                    <FileText size={16} className="text-ink-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="min-w-0 flex-1 pr-2">
                    <h3 className="text-[15px] font-semibold text-text-main/90 truncate group-hover:text-ink-400 transition-colors leading-tight mb-1">{item.title}</h3>
                    <div className="flex items-center gap-1.5 text-[12px] text-text-muted font-medium">
                      <span className="truncate">{item.subject}</span>
                      <span className="shrink-0">•</span>
                      <span className="shrink-0">{timeAgo(item.createdAt)}</span>
                    </div>
                  </div>

                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}


    </div>
  )
}
