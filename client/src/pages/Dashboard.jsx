import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, Upload, Users, FileText, ArrowRight, Flame, 
  Sparkles, TrendingDown, Calendar, Award 
} from 'lucide-react'
import useAuthStore from '../store/authStore'
import api from '../services/api'
import ResourceCard from '../components/shared/ResourceCard'
import { Skeleton } from '../components/shared/utils'

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
      className="card p-5 relative overflow-hidden group cursor-pointer border border-white/5 hover:border-white/20 transition-colors"
    >
      {/* Subtle background glow on hover */}
      <div className={`absolute -right-6 -top-6 w-24 h-24 blur-2xl rounded-full ${color.replace('/30','/20').replace('/20','/10')} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      <div className="flex items-center justify-between mb-3 relative z-10">
        <motion.div 
          initial={{ rotate: -10 }}
          animate={{ rotate: 0 }}
          className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${color}`}
        >
          <Icon size={18} className="text-white" />
        </motion.div>
        {delta && <span className="text-xs text-green-400 font-medium bg-green-500/10 px-2 py-1 rounded-full">{delta}</span>}
      </div>
      
      <div className="relative z-10">
        <p className="text-3xl font-display font-bold text-white bg-clip-text text-transparent bg-gradient-to-br from-white to-white/70">
          {value ?? <Skeleton className="w-12 h-8" />}
        </p>
        <p className="text-xs text-white/50 mt-1 font-medium tracking-wide uppercase">{label}</p>
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
      console.error('Dashboard Fetch Error:', err)
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
        <h1 className="font-display font-bold text-3xl text-white">
          Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-ink-400 to-ink-200">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-white/50 text-sm mt-2 font-medium">Ready to explore and share study resources?</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={container} initial="hidden" animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <motion.div variants={item}>
          <StatCard icon={FileText} label="Total Resources" value={stats?.totalResources} color="bg-ink-500/30" />
        </motion.div>
        <motion.div variants={item}>
          <StatCard icon={Users} label="Students" value={stats?.totalUsers} color="bg-cyan-500/20" />
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
          <h2 className="font-display font-bold text-lg text-white">Browse by Category</h2>
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
              <Link to={`/browse?category=${key}`}
                className={`flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-br ${color} border border-white/5
                           hover:shadow-lg hover:shadow-ink-500/10 transition-all duration-300 group`}>
                <div className="text-3xl mb-3 drop-shadow-md group-hover:scale-110 transition-transform duration-300">{emoji}</div>
                <p className="text-xs font-semibold text-white/80 group-hover:text-white transition-colors">{label}</p>
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
            <h2 className="font-display font-bold text-lg text-white">Recently Uploaded</h2>
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
                  <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Skeleton className="h-28" />
                  </motion.div>
                ))}
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
            <h2 className="font-display font-bold text-lg text-white">Trending Now</h2>
          </div>
          
          <div className="card p-2 border border-white/5 bg-white/[0.02]">
            {loading ? (
              <div className="space-y-2 p-2">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
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
                        <p className="text-sm font-semibold text-white/90 truncate group-hover:text-white transition-colors">
                          {r.title}
                        </p>
                        <p className="text-xs font-medium text-white/40 mt-0.5">{r.downloads} downloads</p>
                      </div>
                      <ArrowRight size={14} className="text-white/20 group-hover:text-ink-400 group-hover:translate-x-1 transition-all" />
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
