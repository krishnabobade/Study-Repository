import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Save, Lock, LogOut, AlertTriangle, User, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import api from '../services/api'

import { MITWPU_SCHOOLS } from '../data/mitwpu'
import { censorText } from '../lib/profanity'

export default function Profile() {
  const { user, setUser, logout } = useAuthStore()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: user?.name || '',
    course: user?.course || '',
    semester: user?.semester || '',
    yearOfStudy: user?.yearOfStudy || '',
    phone: user?.phone || '',
    dob: user?.dob ? user.dob.substring(0, 10) : '',
    gender: user?.gender || 'Prefer not to say',
    bio: user?.bio || '',
  })
  const [passwordForm, setPasswordForm] = useState({ currentPassword:'', newPassword:'' })
  const [saving, setSaving]     = useState(false)
  const [savingPw, setSavingPw] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '')
  const [avatarFile, setAvatarFile]       = useState(null)
  const [avatarPreset, setAvatarPreset]   = useState(user?.avatar && user.avatar.startsWith('/avatars/') ? user.avatar : '')
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const set  = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const setPw = k => e => setPasswordForm(f => ({ ...f, [k]: e.target.value }))

  const handleAvatarChange = e => {
    const f = e.target.files[0]
    if (!f) return
    if (f.size > 2 * 1024 * 1024) return toast.error('Image size must be less than 2MB.')
    setAvatarFile(f)
    setAvatarPreset('')
    setAvatarPreview(URL.createObjectURL(f))
  }

  const handleSelectPreset = (url) => {
    setAvatarPreset(url)
    setAvatarFile(null)
    setAvatarPreview(url)
  }

  const PRESET_AVATARS = [
    { id: 'avatar_1', url: '/avatars/avatar_1.jpg', label: 'Avatar 1' },
    { id: 'avatar_2', url: '/avatars/avatar_2.jpg', label: 'Avatar 2' },
    { id: 'avatar_3', url: '/avatars/avatar_3.jpg', label: 'Avatar 3' },
    { id: 'avatar_4', url: '/avatars/avatar_4.jpg', label: 'Avatar 4' },
    { id: 'avatar_5', url: '/avatars/avatar_5.jpg', label: 'Avatar 5' },
    { id: 'avatar_6', url: '/avatars/avatar_6.jpg', label: 'Avatar 6' }
  ];

  const handleSave = async e => {
    e.preventDefault()
    
    if (form.dob) {
      const birthDate = new Date(form.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 18) {
        return toast.error('You must be at least 18 years old.');
      }
    }

    setSaving(true)
    try {
      const fd = new FormData()
      
      const sanitizedForm = { ...form }
      if (sanitizedForm.name) sanitizedForm.name = censorText(sanitizedForm.name)
      if (sanitizedForm.bio) sanitizedForm.bio = censorText(sanitizedForm.bio)
      if (sanitizedForm.course) sanitizedForm.course = censorText(sanitizedForm.course)

      Object.entries(sanitizedForm).forEach(([k,v]) => {
        if (v !== '' && v !== null) fd.append(k, v)
      })
      if (avatarFile) {
        fd.append('avatar', avatarFile)
      } else if (avatarPreset) {
        fd.append('avatar', avatarPreset)
      }
      const { data } = await api.patch('/users/me', fd)
      setUser(data.user)
      toast.success('Profile updated')
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed') }
    finally { setSaving(false) }
  }

  const handlePasswordChange = async e => {
    e.preventDefault()
    if (passwordForm.newPassword.length < 8) { toast.error('New password must be at least 8 characters'); return }
    setSavingPw(true)
    try {
      await api.patch('/auth/password', passwordForm)
      toast.success('Password updated')
      setPasswordForm({ currentPassword:'', newPassword:'' })
    } catch (err) { toast.error(err.response?.data?.message || 'Password update failed') }
    finally { setSavingPw(false) }
  }

  const handleLogout = () => { 
    logout(); 
    toast.success("Successfully signed out. See you soon!");
    navigate('/login'); 
  }

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto space-y-4 lg:space-y-6">
      <div className="mb-2">
        <h1 className="font-display font-bold text-2xl text-text-main mb-1">Profile</h1>
        <p className="text-text-muted text-sm">Manage your account and preferences</p>
      </div>

      {/* Avatar + basic info */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} className="card p-4 lg:p-6">
        <div className="flex flex-col gap-5">
          {/* Main profile row (Avatar + Name info) */}
          <div className="flex items-center gap-4 lg:gap-5">
            {/* Avatar */}
            <div className="relative group shrink-0">
              <div className="w-20 h-20 rounded-full bg-ink-700 flex items-center justify-center overflow-hidden ring-2 ring-border group-hover:ring-ink-500 transition-all">
                {avatarPreview
                  ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                  : <span className="text-2xl font-bold text-ink-200">{user?.name?.[0]?.toUpperCase()}</span>
                }
              </div>
              <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-ink-500 flex items-center justify-center cursor-pointer hover:bg-ink-400 transition-colors shadow-lg">
                <Camera size={13} className="text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>

            {/* Basic Info */}
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-xl text-text-main truncate">{censorText(user?.name || '')}</p>
              <p className="text-text-muted text-sm truncate">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="badge bg-ink-500/20 text-ink-300 capitalize">{user?.role}</span>
                {user?.collegeName && <span className="badge bg-panel border border-border text-text-muted">{censorText(user.collegeName)}</span>}
                {user?.role !== 'super_admin' && user?.course && <span className="badge bg-panel border border-border text-text-muted">{censorText(user.course)}</span>}
                {user?.role !== 'super_admin' && user?.yearOfStudy && <span className="badge bg-panel border border-border text-text-muted">Year {user.yearOfStudy}</span>}
                {user?.role !== 'super_admin' && user?.semester && <span className="badge bg-panel border border-border text-text-muted">Sem {user.semester}</span>}
              </div>
            </div>
          </div>

          {/* Presets Gallery - aligned in one single line below basic info */}
          <div className="pt-4 border-t border-border/40">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2.5">Choose a Preset Avatar</span>
            <div className="flex gap-2 overflow-x-auto py-1 scrollbar-thin snap-x w-full">
              {PRESET_AVATARS.map(avatar => {
                const isSelected = avatarPreset === avatar.url;
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => handleSelectPreset(avatar.url)}
                    className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0 snap-start ${
                      isSelected ? 'border-ink-500 ring-2 ring-ink-500/20 shadow-md' : 'border-transparent hover:border-border'
                    }`}
                    title={avatar.label}
                  >
                    <img src={avatar.url} alt={avatar.label} className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Stats */}
        {user?.role !== 'super_admin' && (
          <div className="grid grid-cols-2 xs:grid-cols-3 gap-3 mt-5 pt-5 border-t border-border">
            {[
              ['Total Uploads', user?.totalUploads ?? 0], 
              ['Total Downloads', user?.totalDownloads ?? 0],
              ['Total Likes', user?.totalLikes ?? 0],
              ['Total Dislikes', user?.totalDislikes ?? 0],
              ['Avg Rating', user?.avgRating ?? 0],
              ['Ratings', user?.ratingCount ?? 0]
            ].map(([label, val]) => (
              <div key={label} className="text-center p-3 rounded-xl bg-panel/30 border border-border">
                <p className="text-2xl font-display font-bold text-ink-300">{val}</p>
                <p className="text-xs text-text-muted mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Edit profile form */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.08 }} className="card p-4 lg:p-6">
        <h2 className="font-semibold text-text-main mb-4">Edit Profile</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <input className="input" placeholder="Full name" value={form.name} onChange={set('name')} required />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="tel" className="input" placeholder="Phone Number" value={form.phone} onChange={set('phone')} maxLength={10} />
            <input 
              type="date" 
              className="input" 
              value={form.dob} 
              onChange={set('dob')}
              max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
            />
          </div>

          {user?.role !== 'super_admin' ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select className="select" value={form.gender} onChange={set('gender')}>
                  <option value="Prefer not to say">Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <select 
                  className="select" 
                  value={form.yearOfStudy} 
                  onChange={(e) => setForm(f => ({ ...f, yearOfStudy: e.target.value, semester: '' }))}
                >
                  <option value="">Year of Study</option>
                  {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select className="select" value={form.course} onChange={set('course')}>
                  <option value="">Course</option>
                  {MITWPU_SCHOOLS.map(school => (
                    <optgroup key={school.name} label={school.name}>
                      {school.courses.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </optgroup>
                  ))}
                </select>
                <select 
                  className="select" 
                  value={form.semester} 
                  onChange={set('semester')}
                  disabled={!form.yearOfStudy}
                >
                  <option value="">{form.yearOfStudy ? "Semester" : "Select Year First"}</option>
                  {form.yearOfStudy && [parseInt(form.yearOfStudy) * 2 - 1, parseInt(form.yearOfStudy) * 2].map(s => (
                    <option key={s} value={s}>Sem {s}</option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1">
              <select className="select" value={form.gender} onChange={set('gender')}>
                <option value="Prefer not to say">Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          )}

          <textarea className="input resize-none h-24 py-3" placeholder="Bio (optional)"
            value={form.bio} onChange={set('bio')} maxLength={300} />

          <button type="submit" disabled={saving} className="btn-primary mt-2">
            {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
            Save Changes
          </button>
        </form>
      </motion.div>

      {/* Change password */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.12 }} className="card p-4 lg:p-6">
        <h2 className="font-semibold text-text-main mb-4 flex items-center gap-2"><Lock size={16} className="text-ink-400" />Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-3">
          <input type="password" className="input" placeholder="Current password"
            value={passwordForm.currentPassword} onChange={setPw('currentPassword')} required />
          <input type="password" className="input" placeholder="New password (min 8 chars)"
            value={passwordForm.newPassword} onChange={setPw('newPassword')} required />
          <button type="submit" disabled={savingPw} className="btn-primary">
            {savingPw ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Lock size={15} />}
            Update Password
          </button>
        </form>
      </motion.div>

      {/* Danger zone */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.16 }}
        className="card p-4 lg:p-5 border-red-500/20">
        <h2 className="font-semibold text-red-400 mb-3 text-sm">Danger Zone</h2>
        <button onClick={() => setShowLogoutConfirm(true)} className="btn-danger">
          <LogOut size={15} />
          Sign out of all devices
        </button>
      </motion.div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, backdropFilter: 'blur(0px)' }} 
              animate={{ opacity: 1, backdropFilter: 'blur(12px)' }} 
              exit={{ opacity: 0, backdropFilter: 'blur(0px)' }} 
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 bg-surface/50"
              onClick={() => setShowLogoutConfirm(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300, mass: 0.8 }}
              className="modal-container"
            >
              {/* Premium Glow auras */}
              <div className="modal-glow-1" />
              <div className="modal-glow-2" />

              <div className="flex flex-col items-center text-center relative z-10">
                <motion.div 
                  initial={{ rotate: -20, scale: 0.5, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  transition={{ type: "spring", delay: 0.1, stiffness: 200 }}
                  className="w-[56px] h-[56px] rounded-[20px] bg-gradient-to-br from-red-500/20 to-red-600/5 flex items-center justify-center border border-red-500/20 mb-5 shadow-[inset_0_1px_rgba(255,255,255,0.1)] ring-8 ring-red-500/[0.03]"
                >
                  <AlertTriangle size={26} className="text-red-400" />
                </motion.div>
                <h3 className="text-[20px] font-display font-semibold text-text-main tracking-tight mb-2">Sign out everywhere?</h3>
                <p className="text-[15px] text-text-muted mb-8 font-medium leading-relaxed px-2">
                  Are you sure you want to sign out of all your active sessions? You will need to log back in on each device.
                </p>
              </div>
              
              <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3 justify-center w-full relative z-10">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setShowLogoutConfirm(false)}
                  className="btn-secondary w-full sm:flex-1 py-3 justify-center text-[15px]"
                >
                  Cancel
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    handleLogout();
                  }}
                  className="btn-primary bg-red-600 hover:bg-red-500 border-transparent text-white w-full sm:flex-1 py-3 justify-center text-[15px]"
                >
                  Yes, Sign Out
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
