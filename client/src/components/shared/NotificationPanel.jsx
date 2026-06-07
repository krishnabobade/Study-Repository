import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Heart, 
  MessageSquare, 
  Check, 
  AlertTriangle, 
  ThumbsDown, 
  Trash2, 
  Bell, 
  X, 
  BellOff,
  Sparkles,
  Inbox
} from 'lucide-react'

// Helper to get initials
const getInitials = (name) => {
  if (!name) return 'SR'
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

// Map notification type to specific badge configurations
const getBadgeConfig = (type, message) => {
  const lowercaseMsg = (message || '').toLowerCase()
  if (lowercaseMsg.includes('like') && !lowercaseMsg.includes('dislike')) {
    return {
      icon: Heart,
      bg: 'bg-rose-500',
      text: 'text-white border-rose-600',
      glow: 'shadow-rose-500/30'
    }
  }
  if (lowercaseMsg.includes('dislike')) {
    return {
      icon: ThumbsDown,
      bg: 'bg-amber-500',
      text: 'text-white border-amber-600',
      glow: 'shadow-amber-500/30'
    }
  }
  if (lowercaseMsg.includes('rate') || lowercaseMsg.includes('comment')) {
    return {
      icon: MessageSquare,
      bg: 'bg-indigo-500',
      text: 'text-white border-indigo-600',
      glow: 'shadow-indigo-500/30'
    }
  }
  if (lowercaseMsg.includes('approve')) {
    return {
      icon: Check,
      bg: 'bg-emerald-500',
      text: 'text-white border-emerald-600',
      glow: 'shadow-emerald-500/30'
    }
  }
  if (type === 'alert' || lowercaseMsg.includes('reject') || lowercaseMsg.includes('delete')) {
    return {
      icon: AlertTriangle,
      bg: 'bg-red-500',
      text: 'text-white border-red-600',
      glow: 'shadow-red-500/30'
    }
  }
  return {
    icon: Bell,
    bg: 'bg-ink-500',
    text: 'text-white border-ink-600',
    glow: 'shadow-ink-500/30'
  }
}

export default function NotificationPanel({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  loading,
  onMarkRead,
  onMarkAllRead,
  onDelete,
  onClearAll,
  panelRef
}) {
  const navigate = useNavigate()

  const handleNotificationClick = async (notif) => {
    // Mark as read
    if (!notif.read) {
      await onMarkRead(notif._id)
    }
    // Navigate to link if present
    if (notif.link) {
      navigate(notif.link)
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile Overlay — z-[35] so it sits BELOW the header (z-40).
              This is critical: z-40 would cover the bell button itself,
              causing a tap-to-close race where the overlay fires onClose
              and the bell simultaneously re-opens the panel. */}
          <div
            className="fixed inset-0 z-[35] bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />

          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed inset-x-4 top-20 bottom-4 lg:absolute lg:inset-auto lg:right-0 lg:top-12 lg:w-[420px] lg:bottom-auto max-h-[580px] bg-panel border border-border rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.35)] z-50 overflow-hidden flex flex-col font-sans select-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border bg-panel/10">
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-base font-bold text-text-main">Activity</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-ink-500/10 text-ink-400 text-[10px] font-bold shrink-0">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                {notifications.length > 0 && (
                  <button 
                    onClick={onClearAll} 
                    className="text-[11px] sm:text-xs font-bold text-red-400 hover:text-red-300 transition-colors py-1 px-2 rounded-lg bg-red-500/5 hover:bg-red-500/10 active:scale-95 shrink-0"
                  >
                    Clear
                  </button>
                )}
                {unreadCount > 0 && (
                  <button 
                    onClick={onMarkAllRead} 
                    className="text-[11px] sm:text-xs font-bold text-ink-400 hover:text-ink-300 transition-colors py-1 px-2 rounded-lg bg-ink-500/5 hover:bg-ink-500/10 active:scale-95 shrink-0"
                  >
                    Mark read
                  </button>
                )}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="p-2.5 rounded-lg text-text-muted hover:text-text-main hover:bg-surface transition-colors active:scale-95 shrink-0 cursor-pointer"
                  aria-label="Close notifications"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Notification Body List */}
            <div className="flex-1 overflow-y-auto scrollbar-thin divide-y divide-border">
              {loading ? (
                // Shimmer Skeletons
                <div className="p-4 space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex gap-4 items-center">
                      <div className="w-11 h-11 bg-border/20 rounded-full animate-pulse flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-4/5 bg-border/20 rounded animate-pulse" />
                        <div className="h-2 w-1/4 bg-border/20 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                // Empty Inbox UX
                <div className="flex flex-col items-center justify-center py-20 px-6 text-center h-full">
                  <div className="w-16 h-16 rounded-2xl bg-ink-500/10 flex items-center justify-center mb-4 border border-ink-500/20 text-ink-400 relative">
                    <Inbox size={28} />
                    <Sparkles size={16} className="absolute -top-1 -right-1 text-ink-300 animate-pulse" />
                  </div>
                  <h3 className="text-base font-bold text-text-main mb-1">All caught up!</h3>
                  <p className="text-xs text-text-muted max-w-[260px] leading-relaxed">
                    When you receive updates about downloads, comments, or likes, they'll show up here.
                  </p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {notifications.map((notif) => {
                    const badgeConfig = getBadgeConfig(notif.type, notif.message)
                    const BadgeIcon = badgeConfig.icon

                    return (
                      <motion.div
                        key={notif._id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ 
                          opacity: 0, 
                          x: 120,
                          transition: { duration: 0.2, ease: 'easeOut' }
                        }}
                        transition={{ 
                          type: 'spring', 
                          stiffness: 500, 
                          damping: 38,
                          mass: 1
                        }}
                        className={`group relative flex gap-4 px-6 py-4.5 items-center cursor-pointer transition-colors duration-150 ${
                          !notif.read 
                            ? 'bg-ink-500/[0.03] border-l-2 border-ink-500' 
                            : 'hover:bg-surface/40 border-l-2 border-transparent'
                        }`}
                        onClick={() => handleNotificationClick(notif)}
                      >
                        {/* Left Side: Avatar Container */}
                        <div className="relative flex-shrink-0">
                          {notif.triggeredBy ? (
                            <div className="w-11 h-11 rounded-full overflow-hidden border border-border ring-2 ring-transparent group-hover:ring-ink-500/30 transition-all bg-card flex items-center justify-center text-sm font-bold text-ink-300">
                              {notif.triggeredBy.avatar ? (
                                <img 
                                  src={notif.triggeredBy.avatar} 
                                  alt={notif.triggeredBy.name} 
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.target.onerror = null; e.target.src = ''; }}
                                />
                              ) : (
                                <span>{getInitials(notif.triggeredBy.name)}</span>
                              )}
                            </div>
                          ) : (
                            // Institutional/System Notifications
                            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-ink-600 to-indigo-600 border border-border flex items-center justify-center text-white shadow-lg">
                              <Bell size={18} />
                            </div>
                          )}

                          {/* Dynamic Action Icon Overlay Badge */}
                          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border border-panel flex items-center justify-center shadow-md ${badgeConfig.bg} ${badgeConfig.text} ${badgeConfig.glow} scale-90`}>
                            <BadgeIcon size={10} strokeWidth={2.5} />
                          </div>
                        </div>

                        {/* Middle Content */}
                        <div className="flex-1 min-w-0 pr-6">
                          <p className="text-xs text-text-muted leading-snug">
                            {notif.triggeredBy ? (
                              <>
                                <span className="font-bold text-text-main group-hover:text-ink-400 transition-colors">
                                  {notif.triggeredBy.name}
                                </span>{' '}
                                <span className="text-text-main/90">{notif.message}</span>
                              </>
                            ) : (
                              <span className="text-text-main/95 font-medium">{notif.message}</span>
                            )}
                          </p>
                          <span className="text-[10px] text-text-muted/65 mt-1 block">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>

                        {/* Right: Unread indicators and action buttons */}
                        <div className="absolute right-4 flex items-center gap-2">
                          {!notif.read && (
                            <span className="w-2.5 h-2.5 rounded-full bg-ink-500 group-hover:scale-0 transition-transform duration-200" />
                          )}
                          
                          <button
                            onClick={async (e) => {
                              e.stopPropagation()
                              await onDelete(notif._id)
                            }}
                            onPointerDown={(e) => e.stopPropagation()}
                            className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 p-1.5 rounded-md hover:bg-surface text-text-muted hover:text-red-400 transition-all duration-200 active:scale-90"
                            title="Dismiss notification"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              )}
            </div>
            
            {/* Sitelinks footer action */}
            <div className="px-6 py-3.5 border-t border-border bg-panel/10 text-center flex items-center justify-center">
              <Link
                to="/dashboard"
                onClick={onClose}
                className="text-[10px] text-ink-400 hover:text-ink-300 font-semibold hover:underline"
              >
                Go to Dashboard
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
