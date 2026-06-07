import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, LayoutDashboard, GraduationCap, Upload, FolderOpen, 
  User, Shield, MessageSquare, Sun, Moon, LogOut, FileText, CornerDownLeft
} from 'lucide-react'
import useThemeStore from '../../store/themeStore'
import useAuthStore from '../../store/authStore'
import api from '../../services/api'

export default function CommandPalette({ isOpen, onClose }) {
  const navigate = useNavigate()
  const { mode, toggleTheme } = useThemeStore()
  const { user, logout } = useAuthStore()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  
  const inputRef = useRef(null)
  const listRef = useRef(null)

  // Clear query and selection on close/open
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setResults([])
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Define static navigation & system options
  const defaultOptions = [
    { type: 'nav', label: 'Go to Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { type: 'nav', label: 'Browse Academic Roadmaps', to: '/programs', icon: GraduationCap },
    { type: 'nav', label: 'Search All Resources', to: '/browse', icon: Search },
    ...(user?.role !== 'super_admin' ? [
      { type: 'nav', label: 'Upload Study Material', to: '/upload', icon: Upload },
      { type: 'nav', label: 'View My Uploaded Files', to: '/my-files', icon: FolderOpen }
    ] : []),
    { type: 'nav', label: 'Edit Profile Settings', to: '/profile', icon: User },
    ...(user?.role === 'super_admin' ? [
      { type: 'nav', label: 'Manage Platform Users', to: '/admin/users', icon: Shield },
      { type: 'nav', label: 'Manage All Uploaded Files', to: '/admin/resources', icon: Shield },
      { type: 'nav', label: 'View Security Audit Logs', to: '/admin/logs', icon: Shield },
      { type: 'nav', label: 'Review User Feedback', to: '/feedback', icon: MessageSquare }
    ] : []),
    { type: 'action', label: `Toggle Theme (Currently ${mode === 'dark' ? 'Dark' : 'Light'})`, action: 'theme', icon: mode === 'dark' ? Sun : Moon },
    { type: 'action', label: 'Sign Out of Account', action: 'logout', icon: LogOut }
  ]

  // Filter static actions + dynamic API search
  useEffect(() => {
    if (!query) {
      setResults(defaultOptions)
      setActiveIndex(0)
      return
    }

    const filteredStatic = defaultOptions.filter(opt => 
      opt.label.toLowerCase().includes(query.toLowerCase())
    )

    if (query.length < 2) {
      setResults(filteredStatic)
      setActiveIndex(0)
      return
    }

    // Debounced dynamic API search
    setLoading(true)
    const delayDebounce = setTimeout(async () => {
      try {
        const { data } = await api.get(`/resources?search=${encodeURIComponent(query)}&limit=5`)
        const apiOptions = (data.resources || []).map(r => ({
          type: 'resource',
          label: r.title,
          sublabel: `${r.course} · Sem ${r.semester} · ${r.category.toUpperCase()}`,
          to: `/resources/${r._id}`,
          icon: FileText
        }))
        setResults([...filteredStatic, ...apiOptions])
      } catch (err) {
        setResults(filteredStatic)
      } finally {
        setLoading(false)
      }
      setActiveIndex(0)
    }, 250)

    return () => clearTimeout(delayDebounce)
  }, [query, mode])

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex(prev => (prev + 1) % results.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex(prev => (prev - 1 + results.length) % results.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (results[activeIndex]) {
          handleSelect(results[activeIndex])
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, activeIndex])

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[activeIndex]
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [activeIndex])

  const handleSelect = (item) => {
    onClose()
    if (item.type === 'nav' || item.type === 'resource') {
      navigate(item.to)
    } else if (item.type === 'action') {
      if (item.action === 'theme') {
        toggleTheme()
      } else if (item.action === 'logout') {
        logout()
        navigate('/login')
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-start justify-center p-4 pt-[10vh] overflow-hidden">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.15 }}
            className="relative bg-card border border-border shadow-2xl rounded-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[70vh] bg-clip-padding"
          >
            {/* Input Bar */}
            <div className="relative flex items-center border-b border-border p-4 gap-3 shrink-0">
              <Search size={18} className="text-text-muted shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search resources, options, and settings..."
                className="w-full bg-transparent border-0 outline-none text-text-main placeholder-text-muted/65 text-sm p-0 focus:ring-0"
              />
              {loading && (
                <div className="w-4 h-4 border-2 border-border border-t-ink-500 rounded-full animate-spin shrink-0" />
              )}
            </div>

            {/* List */}
            <div 
              ref={listRef}
              className="flex-1 overflow-y-auto p-2 space-y-0.5 scrollbar-thin"
            >
              {results.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm font-semibold text-text-main">No results found</p>
                  <p className="text-xs text-text-muted mt-1">Try searching for other pages or files</p>
                </div>
              ) : (
                results.map((item, idx) => {
                  const Icon = item.icon
                  const isActive = idx === activeIndex
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-100
                        ${isActive 
                          ? 'bg-ink-500/15 text-ink-300 border border-ink-500/20' 
                          : 'text-text-muted hover:text-text-main border border-transparent'}`}
                    >
                      <Icon size={16} className={isActive ? 'text-ink-400' : 'text-text-muted/50'} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.label}</p>
                        {item.sublabel && (
                          <p className="text-[11px] text-text-muted mt-0.5 truncate">{item.sublabel}</p>
                        )}
                      </div>
                      {isActive && (
                        <div className="flex items-center gap-1 text-[10px] bg-ink-500/20 px-2 py-0.5 rounded text-ink-400 font-mono shadow-sm">
                          <span>Enter</span>
                          <CornerDownLeft size={10} />
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
