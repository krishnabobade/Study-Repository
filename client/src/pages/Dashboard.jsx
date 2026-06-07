import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, Upload, Users, FileText, ArrowRight, Flame, 
  Sparkles, TrendingDown, Calendar, Award, Search, User,
  Crown, Trophy, RefreshCw, Heart, Eye, Download
} from 'lucide-react'
import toast from 'react-hot-toast'
import { io } from 'socket.io-client'
import useAuthStore from '../store/authStore'
import api from '../services/api'
import ResourceCard from '../components/shared/ResourceCard'
import Skeleton, { SkeletonText, SkeletonTitle, SkeletonAvatar, SkeletonImage, SkeletonCard, SkeletonList, SkeletonResourceCard } from '../components/shared/Skeleton.jsx'


const CATEGORIES = [
  { key: 'notes',      label: 'Notes',       emoji: '📝', color: 'from-ink-600/30 to-ink-500/10' },
  { key: 'qpaper',     label: 'Q. Papers',   emoji: '📋', color: 'from-yellow-600/20 to-yellow-500/5' },
  { key: 'assignment', label: 'Assignments', emoji: '✏️', color: 'from-cyan-600/20 to-cyan-500/5' },
  { key: 'lab',        label: 'Lab Manuals', emoji: '🔬', color: 'from-orange-600/20 to-orange-500/5' },
  { key: 'formula',    label: 'Formulas',    emoji: '⚡', color: 'from-pink-600/20 to-pink-500/5' },
  { key: 'project',    label: 'Projects',    emoji: '🚀', color: 'from-green-600/20 to-green-500/5' },
]

function StatCard({ icon: Icon, label, value, delta, color, loading }) {
  return (
    <motion.div 
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="card p-4 lg:p-5 relative overflow-hidden group cursor-pointer border border-white/5 hover:border-border transition-colors"
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
        <div className="h-9 flex items-center">
          {loading ? (
            <SkeletonTitle width="50%" className="h-7 opacity-60" />
          ) : (
            <p className="text-2xl lg:text-3xl font-display font-bold text-text-main bg-clip-text">
              {value}
            </p>
          )}
        </div>
        <p className="text-xs text-text-muted mt-1 font-medium tracking-wide uppercase">{label}</p>
      </div>
    </motion.div>
  )
}

export default function Dashboard() {
  const { user, refreshUser } = useAuthStore()
  const [recent, setRecent] = useState([])
  const [trendingData, setTrendingData] = useState(null)
  const [timeframe, setTimeframe] = useState('weekly')
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = () => {
      const currentUser = useAuthStore.getState().user;
      if (currentUser?.role !== 'super_admin') {
        refreshUser();
      }
      Promise.all([
        api.get('/resources?limit=6&sort=-createdAt'),
        api.get('/trending'),
        api.get('/analytics/stats'),
      ]).then(([r, t, s]) => {
        setRecent(r.data.resources)
        if (t.data?.success) {
          setTrendingData(t.data.trending)
        }
        setStats(s.data.stats)
      }).catch((err) => {
        if (loading) toast.error('Failed to load dashboard data.')
      }).finally(() => setLoading(false))
    }

    fetchData()
    const interval = setInterval(fetchData, 30000) // Refresh every 30s

    // WebSocket live updates
    const backendUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') 
      : 'http://localhost:5000'
    const socket = io(backendUrl)
    socket.on('trending_update', (newTrendingData) => {
      setTrendingData(newTrendingData)
    })

    return () => {
      clearInterval(interval)
      socket.disconnect()
    }
  }, [])

  const activeResources = trendingData?.[timeframe]?.resources || []
  const displayResources = activeResources.slice(0, 4)

  const activeCreators = trendingData?.[timeframe]?.creators || []
  const displayCreators = activeCreators.slice(0, 4)

  const container = { 
    hidden: {}, 
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } 
  }
  const item = { 
    hidden: { opacity: 0, y: 20 }, 
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } 
  }

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-8 lg:space-y-10 relative">
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
      {(user?.role !== 'super_admin' && user?.totalUploads === 0) && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-ink-500/10 to-primary-500/5 border border-ink-500/20 rounded-2xl p-6 relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-ink-500/10 to-transparent pointer-events-none" />
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
            <div className="w-12 h-12 bg-ink-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-ink-500/20">
              <Sparkles size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-text-main mb-1">Getting Started</h3>
              <p className="text-sm text-text-muted mb-4 max-w-2xl">
                Welcome to your new Study Repository! Your dashboard is looking a little empty right now. Here are some quick actions to get you up to speed.
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
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
        className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <motion.div variants={item}>
          <StatCard icon={FileText} label="Total Resources" value={stats?.totalResources} color="bg-ink-500/30" loading={loading} />
        </motion.div>
        <motion.div variants={item}>
          <StatCard icon={Users} label="Users" value={stats?.totalUsers} color="bg-cyan-500/20" loading={loading} />
        </motion.div>
        <motion.div variants={item}>
          <StatCard icon={TrendingUp} label="Total Downloads" value={user?.role === 'super_admin' ? stats?.totalDownloads : (user?.totalDownloads ?? 0)} color="bg-green-500/20" loading={loading} />
        </motion.div>
        <motion.div variants={item}>
          <StatCard icon={Upload} label="My Uploads" value={user?.totalUploads} color="bg-orange-500/20" loading={loading} />
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
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {CATEGORIES.map(({ key, label, emoji, color }) => (
            <motion.div key={key} variants={item} whileHover={{ y: -4, scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link to={key === 'assignment' ? '/assignments' : `/browse?category=${key}`}
                className={`flex flex-col items-center justify-center p-4 lg:p-5 rounded-2xl bg-gradient-to-br ${color} border border-white/5
                           hover:shadow-lg hover:shadow-ink-500/10 transition-all duration-300 group`}>
                <div className="text-2xl lg:text-3xl mb-2 lg:mb-3 drop-shadow-md group-hover:scale-110 transition-transform duration-300">{emoji}</div>
                <p className="text-xs font-semibold text-text-muted group-hover:text-text-main transition-colors">{label}</p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 pb-10">
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
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <SkeletonResourceCard />
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

        {/* Right column: Timeframe, Trending Resources & Contributors */}
        <div className="space-y-6">
          {/* Timeframe selector */}
          <div className="flex items-center justify-between p-1 bg-white/[0.02] border border-white/5 rounded-2xl">
            {['daily', 'weekly', 'monthly', 'all'].map((tKey) => (
              <button
                key={tKey}
                onClick={() => setTimeframe(tKey)}
                className={`flex-1 py-1.5 px-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${
                  timeframe === tKey
                    ? 'bg-ink-500/15 border border-ink-500/30 text-ink-300 shadow-sm'
                    : 'text-text-muted hover:text-text-main hover:bg-white/[0.01] border border-transparent'
                }`}
              >
                {tKey === 'all' ? 'All-Time' : tKey}
              </button>
            ))}
          </div>

          {/* Trending Resources Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="card p-4 border border-white/5 bg-white/[0.02]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                  <Flame size={18} className="text-orange-400" />
                </motion.div>
                <h2 className="font-display font-bold text-lg text-text-main">Trending Now</h2>
              </div>
            </div>
            
            <div className="p-1">
              {loading ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
                </div>
              ) : displayResources.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-sm font-medium text-text-muted">No trending items yet</p>
                </div>
              ) : (
                <motion.div variants={container} initial="hidden" animate="show" className="space-y-1">
                  {displayResources.map((r, i) => (
                    <motion.div key={r._id} variants={item} whileHover={{ scale: 1.02 }} className="rounded-xl hover:bg-white/[0.02] transition-colors">
                      <Link to={`/resources/${r._id}`}
                        className="flex items-center gap-4 p-2.5 rounded-xl transition-all duration-300 group">
                        <div className="w-7 h-7 rounded-lg bg-ink-500/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-display font-bold text-ink-300 group-hover:text-ink-400">
                            #{i + 1}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-text-main/90 truncate group-hover:text-text-main transition-colors">
                            {r.title}
                          </p>
                          <p className="text-xs font-medium text-text-muted mt-0.5">{r.downloads || 0} downloads</p>
                        </div>
                        <ArrowRight size={14} className="text-text-muted/40 group-hover:text-ink-400 group-hover:translate-x-1 transition-all" />
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Top Contributor Ranks Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="card p-4 border border-white/5 bg-white/[0.02] relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-ink-500/10 flex items-center justify-center">
                  <Award size={18} className="text-ink-400" />
                </div>
                <h2 className="font-display font-bold text-lg text-text-main">Top Scholars</h2>
              </div>
              <span className="text-[10px] font-bold text-text-muted bg-white/5 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                Ranks
              </span>
            </div>

            <div className="p-1">
              {loading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="w-7 h-7 rounded-lg shrink-0" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-2/3 rounded" />
                        <Skeleton className="h-3 w-1/2 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : displayCreators.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-sm font-medium text-text-muted">No contributors ranked yet</p>
                </div>
              ) : (
                <motion.div variants={container} initial="hidden" animate="show" className="space-y-1">
                  {displayCreators.map((item, i) => {
                    const rank = i + 1;
                    const rankBgColor = 
                      rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-bold' :
                      rank === 2 ? 'bg-gradient-to-r from-slate-300 to-slate-400 text-slate-950 font-bold' :
                      rank === 3 ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold' :
                      'bg-white/5 text-text-muted';

                    return (
                      <motion.div
                        key={item.user._id}
                        variants={item}
                        whileHover={{ scale: 1.02 }}
                        className="rounded-xl hover:bg-white/[0.02] transition-colors p-2 flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Rank Badge */}
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs ${rankBgColor}`}>
                            {rank === 1 ? <Crown size={12} className="fill-slate-950" /> : `#${rank}`}
                          </div>

                          {/* Avatar */}
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-800 shrink-0 border border-white/5">
                            {item.user.avatar ? (
                              <img src={item.user.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs font-black text-text-main">
                                {item.user.name[0].toUpperCase()}
                              </div>
                            )}
                          </div>

                          {/* Contributor Details */}
                          <div className="min-w-0">
                            <Link to={`/profile/${item.user._id}`} className="font-bold text-sm text-text-main/90 group-hover:text-text-main hover:underline truncate block">
                              {item.user.name}
                            </Link>
                            <p className="text-[10px] text-text-muted truncate mt-0.5">
                              {item.user.department || item.user.collegeName || 'Active Scholar'}
                            </p>
                          </div>
                        </div>

                        {/* Score Indicator */}
                        <div className="flex flex-col items-end shrink-0">
                          <span className="text-xs font-extrabold text-ink-300 font-display">
                            {Math.round(item.score)}
                          </span>
                          <span className="text-[8px] text-text-muted uppercase font-bold tracking-wider">
                            Score
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
