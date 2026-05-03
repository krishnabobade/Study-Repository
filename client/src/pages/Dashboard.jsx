import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, Upload, Users, FileText, ArrowRight, Flame, 
  Sparkles, TrendingDown, Calendar, Award, Search, User 
} from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import api from '../services/api'
import ResourceCard from '../components/shared/ResourceCard'
import Skeleton, { SkeletonText, SkeletonTitle, SkeletonAvatar, SkeletonImage, SkeletonCard, SkeletonList } from '../components/shared/Skeleton.jsx'


const CATEGORIES = [
  { key: 'notes',      label: 'Notes',       emoji: '📝', color: 'from-ink-600/30 to-ink-500/10' },
  { key: 'qpaper',     label: 'Q. Papers',   emoji: '📋', color: 'from-yellow-600/20 to-yellow-500/5' },
  { key: 'assignment', label: 'Assignments', emoji: '✏️', color: 'from-cyan-600/20 to-cyan-500/5' },
  { key: 'lab',        label: 'Lab Manuals', emoji: '🔬', color: 'from-orange-600/20 to-orange-500/5' },
  { key: 'formula',    label: 'Formulas',    emoji: '⚡', color: 'from-pink-600/20 to-pink-500/5' },
  { key: 'project',    label: 'Projects',    emoji: '🚀', color: 'from-green-600/20 to-green-500/5' },
]

function StatCard({ icon: Icon, label, value, delta, color }) {
  return (
    <motion.div 
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="card p-5 relative overflow-hidden group cursor-pointer border border-white/5 hover:border-border transition-colors"
    >
      {/* Subtle background glow on hover */}
      <div className={`absolute -right-6 -top-6 w-24 h-24 blur-2xl rounded-full ${color.replace('/30','/20').replace('/20','/10')} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      <div className="flex items-center justify-between mb-3 relative z-10">
        <motion.div 
          initial={{ rotate: -10 }}
          animate={{ rotate: 0 }}
          className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${color}`}
        >
          <Icon size={18} className="text-text-main" />
        </motion.div>
        {delta && <span className="text-xs text-green-400 font-medium bg-green-500/10 px-2 py-1 rounded-full">{delta}</span>}
      </div>
      
      <div className="relative z-10">
        <p className="text-3xl font-display font-bold text-text-main bg-clip-text">
          {value ?? <SkeletonTitle width="50%" className="h-8 mb-1" />}
        </p>
        <p className="text-xs text-text-muted mt-1 font-medium tracking-wide uppercase">{label}</p>
      </div>
    </motion.div>
  )
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const [recent, setRecent] = useState([])
  const [trending, setTrending] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/resources?limit=6&sort=-createdAt'),
      api.get('/resources/trending'),
      api.get('/analytics/stats'),
    ]).then(([r, t, s]) => {
      setRecent(r.data.resources)
      setTrending(t.data.resources.slice(0, 4))
      setStats(s.data.stats)
    }).catch((err) => {
      toast.error('Failed to load dashboard data.')
    }).finally(() => setLoading(false))
  }, [])

  const container = { 
    hidden: {}, 
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } 
  }
  const item = { 
    hidden: { opacity: 0, y: 20 }, 
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } 
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-10 relative">
      {/* Background ambient light */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-ink-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Welcome */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }} 
        animate={{ opacity: 1, x: 0 }} 
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <h1 className="font-display font-bold text-3xl text-text-main">
          Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-ink-400 to-ink-500">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-text-muted text-sm mt-2 font-medium">Ready to explore and share study resources?</p>
      </motion.div>

      {/* Onboarding / Getting Started (Shows if user is new) */}
      {(user?.role !== 'super_admin' && user?.totalUploads === 0 && (!stats || stats.totalDownloads === 0)) && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-ink-500/10 to-primary-500/5 border border-ink-500/20 rounded-2xl p-6 relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-ink-500/10 to-transparent pointer-events-none" />
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-ink-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-ink-500/20">
              <Sparkles size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-main mb-1">Getting Started</h3>
              <p className="text-sm text-text-muted mb-4 max-w-2xl">
                Welcome to your new Study Repository! Your dashboard is looking a little empty right now. Here are some quick actions to get you up to speed.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/upload" className="px-4 py-2 bg-ink-500 hover:bg-ink-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm inline-flex items-center gap-2">
                  <Upload size={16} /> Upload a Note
                </Link>
                <Link to="/browse" className="px-4 py-2 bg-panel border border-border hover:bg-surface text-text-main rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2">
                  <Search size={16} /> Browse Resources
                </Link>
                <Link to="/profile" className="px-4 py-2 bg-panel border border-border hover:bg-surface text-text-main rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2">
                  <User size={16} /> Complete Profile
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <motion.div variants={container} initial="hidden" animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <motion.div variants={item}>
          <StatCard icon={FileText} label="Total Resources" value={stats?.totalResources} color="bg-ink-500/30" />
        </motion.div>
        <motion.div variants={item}>
          <StatCard icon={Users} label="Users" value={stats?.totalUsers} color="bg-cyan-500/20" />
        </motion.div>
        <motion.div variants={item}>
          <StatCard icon={TrendingUp} label="Total Downloads" value={stats?.totalDownloads} color="bg-green-500/20" />
        </motion.div>
        <motion.div variants={item}>
          <StatCard icon={Upload} label="My Uploads" value={user?.totalUploads} color="bg-orange-500/20" />
        </motion.div>
      </motion.div>

      {/* Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-lg text-text-main">Browse by Category</h2>
          <Link to="/browse" className="text-xs font-semibold text-ink-400 hover:text-ink-300 flex items-center gap-1 group transition-colors">
            View all 
            <motion.span animate={{ x: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              <ArrowRight size={12} />
            </motion.span>
          </Link>
        </div>
        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORIES.map(({ key, label, emoji, color }) => (
            <motion.div key={key} variants={item} whileHover={{ y: -4, scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link to={key === 'assignment' ? '/assignments' : `/browse?category=${key}`}
                className={`flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-br ${color} border border-white/5
                           hover:shadow-lg hover:shadow-ink-500/10 transition-all duration-300 group`}>
                <div className="text-3xl mb-3 drop-shadow-md group-hover:scale-110 transition-transform duration-300">{emoji}</div>
                <p className="text-xs font-semibold text-text-muted group-hover:text-text-main transition-colors">{label}</p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8 pb-10">
        {/* Recent uploads */}
        <motion.div 
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-lg text-text-main">Recently Uploaded</h2>
            <Link to="/browse" className="text-xs font-semibold text-ink-400 hover:text-ink-300 flex items-center gap-1 group">
              View all 
              <motion.span animate={{ x: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}>
                <ArrowRight size={12} />
              </motion.span>
            </Link>
          </div>
          
          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-panel border border-border rounded-2xl p-4 flex gap-4 animate-pulse">
                    <SkeletonImage ratio="16/9" className="w-32 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <SkeletonTitle width="40%" />
                      <SkeletonText lines={2} />
                    </div>
                  </div>
                ))}
              </div>
            ) : recent.length === 0 ? (
              <div className="card p-8 flex flex-col items-center justify-center text-center border-dashed">
                <FileText size={32} className="text-text-muted/50 mb-3" />
                <p className="text-sm font-semibold text-text-main">No recent uploads</p>
                <p className="text-xs text-text-muted mt-1">Be the first to share a resource!</p>
              </div>
            ) : (
              <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
                {recent.map((r, i) => (
                  <motion.div 
                    key={r._id} 
                    variants={item}
                    whileHover={{ scale: 1.01, x: 4 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <ResourceCard resource={r} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Trending */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-5">
            <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
              <Flame size={18} className="text-orange-400" />
            </motion.div>
            <h2 className="font-display font-bold text-lg text-text-main">Trending Now</h2>
          </div>
          
          <div className="card p-2 border border-white/5 bg-white/[0.02]">
            {loading ? (
              <div className="space-y-2 p-2">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
              </div>
            ) : trending.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm font-medium text-text-muted">No trending items yet</p>
              </div>
            ) : (
              <motion.div variants={container} initial="hidden" animate="show" className="space-y-1">
                {trending.map((r, i) => (
                  <motion.div key={r._id} variants={item} whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }} className="rounded-xl">
                    <Link to={`/resources/${r._id}`}
                      className="flex items-center gap-4 p-3 rounded-xl transition-all duration-300 group">
                      <div className="w-8 h-8 rounded-lg bg-ink-500/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-display font-bold text-ink-300 group-hover:text-ink-400">
                          #{i + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text-main/90 truncate group-hover:text-text-main transition-colors">
                          {r.title}
                        </p>
                        <p className="text-xs font-medium text-text-muted mt-0.5">{r.downloads} downloads</p>
                      </div>
                      <ArrowRight size={14} className="text-text-muted/40 group-hover:text-ink-400 group-hover:translate-x-1 transition-all" />
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
