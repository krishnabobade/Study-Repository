import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Search, Upload, FolderOpen, User,
  Bell, LogOut, Menu, X, BookOpen, ChevronRight, GraduationCap
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import api from '../../services/api'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/programs',  icon: GraduationCap,   label: 'Programs' },
  { to: '/browse',    icon: Search,          label: 'Browse' },
  { to: '/upload',    icon: Upload,          label: 'Upload' },
  { to: '/my-files',  icon: FolderOpen,      label: 'My Files' },
  { to: '/profile',   icon: User,            label: 'Profile' },
]

import { io } from 'socket.io-client';

export default function DashboardLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    // Initial fetch
    api.get('/notifications').then(r => {
      setNotifications(r.data.notifications || []);
      setUnread(r.data.unreadCount || 0);
    }).catch(console.error);

    // Socket.IO Realtime Connection
    if (!user) return;
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
    socket.emit('join_user_channel', user._id || user.id);

    socket.on('new_notification', (notif) => {
      setNotifications(prev => [notif, ...prev]);
      setUnread(prev => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && logoutConfirmOpen) setLogoutConfirmOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [logoutConfirmOpen]);

  const handleLogout = () => { logout(); navigate('/login') }

  const markAllRead = async () => {
    await api.patch('/notifications/mark-all-read')
    setUnread(0)
    setNotifications(n => n.map(x => ({ ...x, read: true })))
  }

  const avatar = user?.avatar
    ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
    : <span className="text-sm font-semibold text-ink-200">{user?.name?.[0]?.toUpperCase()}</span>

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full ${mobile ? '' : ''}`}>
      {/* Logo */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-ink-500 flex items-center justify-center">
            <BookOpen size={18} className="text-white" />
          </div>
          <span className="font-display font-bold text-lg text-white">Study Repository</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            onClick={() => mobile && setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
               ${isActive
                 ? 'bg-ink-500/20 text-ink-300 border border-ink-500/30'
                 : 'text-white/50 hover:text-white hover:bg-white/5'}`
            }>
            {({ isActive }) => <>
              <Icon size={17} className={isActive ? 'text-ink-400' : 'text-white/40 group-hover:text-white/70'} />
              {label}
              {isActive && <ChevronRight size={13} className="ml-auto text-ink-400" />}
            </>}
          </NavLink>
        ))}
      </nav>

      {/* Quick Stats */}
      <div className="mx-3 mb-4 p-4 rounded-xl bg-white/[0.03] border border-white/5">
        <p className="text-xs text-white/40 mb-3 font-medium uppercase tracking-wider">Quick Stats</p>
        <div className="space-y-2">
          {[
            ['Uploads', user?.totalUploads ?? 0],
            ['Downloads', user?.totalDownloads ?? 0],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between items-center">
              <span className="text-xs text-white/50">{label}</span>
              <span className="text-xs font-semibold text-ink-300">{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* User + logout */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-ink-700 flex items-center justify-center overflow-hidden shrink-0">
            {avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-white/40 truncate">{user?.email}</p>
          </div>
          <button onClick={() => { setLogoutConfirmOpen(true); if (mobile) setSidebarOpen(false); }} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-red-400 transition-colors">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-panel border-r border-border shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)} />
            <motion.aside
              initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-60 bg-panel border-r border-border z-50 lg:hidden">
              <Sidebar mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-panel/80 backdrop-blur border-b border-border flex items-center px-4 gap-4 shrink-0">
          <button onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-white/60">
            <Menu size={18} />
          </button>

          <div className="flex-1" />

          {/* Notifications */}
          <div className="relative">
            <button onClick={() => setNotifOpen(o => !o)}
              className="relative p-2 rounded-xl hover:bg-white/5 text-white/60 hover:text-white transition-colors">
              <Bell size={18} />
              {unread > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-ink-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 w-80 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <span className="text-sm font-semibold text-white">Notifications</span>
                    {unread > 0 && (
                      <button onClick={markAllRead} className="text-xs text-ink-400 hover:text-ink-300">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0
                      ? <p className="text-center text-white/40 text-sm py-8">No notifications</p>
                      : notifications.map(n => (
                        <div key={n._id}
                          onClick={async () => {
                            if (!n.read) {
                              await api.patch(`/notifications/${n._id}/read`)
                              setNotifications(prev => prev.map(x => x._id === n._id ? { ...x, read: true } : x))
                              setUnread(u => Math.max(0, u - 1))
                            }
                          }}
                          className={`px-4 py-3 border-b border-border/50 cursor-pointer hover:bg-white/5 transition-colors ${!n.read ? 'bg-ink-500/5' : ''}`}>
                          <p className="text-sm text-white/80">{n.message}</p>
                          <p className="text-[10px] text-white/30 mt-1 uppercase font-bold tracking-wider">{new Date(n.createdAt).toLocaleTimeString()} • {new Date(n.createdAt).toLocaleDateString()}</p>
                        </div>
                      ))
                    }
                  </div>
                  <button onClick={() => setNotifOpen(false)}
                    className="absolute top-3 right-3 p-1 text-white/40 hover:text-white transition-colors">
                    <X size={14} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Avatar */}
          <NavLink to="/profile" className="w-8 h-8 rounded-full bg-ink-700 flex items-center justify-center overflow-hidden ring-2 ring-transparent hover:ring-ink-500 transition-all">
            {avatar}
          </NavLink>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="h-full">
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {logoutConfirmOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, backdropFilter: 'blur(0px)' }} 
              animate={{ opacity: 1, backdropFilter: 'blur(12px)' }} 
              exit={{ opacity: 0, backdropFilter: 'blur(0px)' }} 
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setLogoutConfirmOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300, mass: 0.8 }}
              className="relative w-full max-w-sm bg-panel/90 backdrop-blur-3xl border border-white/10 rounded-[28px] p-7 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] flex flex-col"
            >
              <div className="flex flex-col items-center text-center">
                <motion.div 
                  initial={{ rotate: -20, scale: 0.5, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  transition={{ type: "spring", delay: 0.1, stiffness: 200 }}
                  className="w-[56px] h-[56px] rounded-[20px] bg-gradient-to-br from-red-500/20 to-red-600/5 flex items-center justify-center border border-red-500/20 mb-5 shadow-[inset_0_1px_rgba(255,255,255,0.1)] ring-8 ring-red-500/[0.03]"
                >
                  <LogOut size={26} className="text-red-400" />
                </motion.div>
                <h3 className="text-[20px] font-display font-semibold text-white tracking-tight mb-2">Are you sure you want to log out?</h3>
                <p className="text-[15px] text-white/50 mb-8 font-medium leading-relaxed px-2">
                  You will need to sign back in to access your dashboard.
                </p>
              </div>
              
              <div className="flex gap-3 justify-center w-full">
                <motion.button 
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setLogoutConfirmOpen(false)}
                  className="flex-1 py-3 rounded-2xl text-[15px] font-semibold text-white/80 bg-white/5 border border-white/10 shadow-sm transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(239,68,68,0.25)", boxShadow: "0 0 30px rgba(239,68,68,0.15)" }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleLogout}
                  className="flex-1 py-3 rounded-2xl text-[15px] font-bold text-red-400 bg-red-500/15 border border-red-500/20 transition-all shadow-sm"
                >
                  Logout
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
