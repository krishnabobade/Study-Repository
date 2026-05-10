import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Save, Lock, LogOut, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import api from '../services/api'

import { MITWPU_SCHOOLS } from '../data/mitwpu'

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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const set  = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const setPw = k => e => setPasswordForm(f => ({ ...f, [k]: e.target.value }))

  const handleAvatarChange = e => {
    const f = e.target.files[0]
    if (!f) return
    setAvatarFile(f)
    setAvatarPreview(URL.createObjectURL(f))
  }

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
      Object.entries(form).forEach(([k,v]) => {
        if (v !== '' && v !== null) fd.append(k, v)
      })
      if (avatarFile) fd.append('avatar', avatarFile)
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

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="mb-2">
        <h1 className="font-display font-bold text-2xl text-text-main mb-1">Profile</h1>
        <p className="text-text-muted text-sm">Manage your account and preferences</p>
      </div>

      {/* Avatar + basic info */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} className="card p-6">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="relative group shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-ink-700 flex items-center justify-center overflow-hidden ring-2 ring-border group-hover:ring-ink-500 transition-all">
              {avatarPreview
                ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                : <span className="text-2xl font-bold text-ink-200">{user?.name?.[0]?.toUpperCase()}</span>
              }
            </div>
            <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-ink-500 flex items-center justify-center cursor-pointer
                              hover:bg-ink-400 transition-colors shadow-lg">
              <Camera size={13} className="text-text-main" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>

          <div className="flex-1">
            <p className="font-display font-bold text-xl text-text-main">{user?.name}</p>
            <p className="text-text-muted text-sm">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="badge bg-ink-500/20 text-ink-300 capitalize">{user?.role}</span>
              {user?.collegeName && <span className="badge bg-panel border border-border text-text-muted">{user.collegeName}</span>}
              {user?.role !== 'super_admin' && user?.course && <span className="badge bg-panel border border-border text-text-muted">{user.course}</span>}
              {user?.role !== 'super_admin' && user?.yearOfStudy && <span className="badge bg-panel border border-border text-text-muted">Year {user.yearOfStudy}</span>}
              {user?.role !== 'super_admin' && user?.semester && <span className="badge bg-panel border border-border text-text-muted">Sem {user.semester}</span>}
            </div>
          </div>
        </div>

        {/* Stats */}
        {user?.role !== 'super_admin' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-5 pt-5 border-t border-border">
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
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.08 }} className="card p-6">
        <h2 className="font-semibold text-text-main mb-4">Edit Profile</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <input className="input" placeholder="Full name" value={form.name} onChange={set('name')} required />
          
          <div className="grid grid-cols-2 gap-3">
            <input type="tel" className="input" placeholder="Phone Number" value={form.phone} onChange={set('phone')} maxLength={10} />
            <input 
              type="date" 
              className="input text-text-muted" 
              value={form.dob} 
              onChange={set('dob')}
              max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
            />
          </div>

          {user?.role !== 'super_admin' ? (
            <>
              <div className="grid grid-cols-2 gap-3">
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

              <div className="grid grid-cols-2 gap-3">
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
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.12 }} className="card p-6">
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
        className="card p-5 border-red-500/20">
        <h2 className="font-semibold text-red-400 mb-3 text-sm">Danger Zone</h2>
        <button onClick={() => setShowLogoutConfirm(true)} className="btn-danger">
          <LogOut size={15} />
          Sign out of all devices
        </button>
      </motion.div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-panel border border-border rounded-3xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <AlertTriangle className="text-red-500" size={24} />
              </div>
              <h3 className="text-lg font-bold text-text-main text-center">Sign Out Everywhere?</h3>
              <p className="text-sm text-text-muted text-center mt-2 mb-6">
                Are you sure you want to sign out of all your active sessions? You will need to log in again.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2.5 bg-panel border border-border text-text-main rounded-xl font-semibold hover:bg-surface transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    handleLogout();
                  }}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors"
                >
                  Yes, Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
