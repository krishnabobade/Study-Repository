import { useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, Save, Lock, LogOut } from 'lucide-react'
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
        <h1 className="font-display font-bold text-2xl text-white mb-1">Profile</h1>
        <p className="text-white/50 text-sm">Manage your account and preferences</p>
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
              <Camera size={13} className="text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>

          <div className="flex-1">
            <p className="font-display font-bold text-xl text-white">{user?.name}</p>
            <p className="text-white/50 text-sm">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="badge bg-ink-500/20 text-ink-300 capitalize">{user?.role}</span>
              {user?.collegeName && <span className="badge bg-white/5 text-white/50">{user.collegeName}</span>}
              {user?.course && <span className="badge bg-white/5 text-white/60">{user.course}</span>}
              {user?.yearOfStudy && <span className="badge bg-white/5 text-white/60">Year {user.yearOfStudy}</span>}
              {user?.semester && <span className="badge bg-white/5 text-white/60">Sem {user.semester}</span>}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-border">
          {[['Total Uploads', user?.totalUploads ?? 0], ['Total Downloads', user?.totalDownloads ?? 0]].map(([label, val]) => (
            <div key={label} className="text-center p-3 rounded-xl bg-white/[0.03]">
              <p className="text-2xl font-display font-bold text-ink-300">{val}</p>
              <p className="text-xs text-white/40 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Edit profile form */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.08 }} className="card p-6">
        <h2 className="font-semibold text-white mb-4">Edit Profile</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <input className="input" placeholder="Full name" value={form.name} onChange={set('name')} required />
          
          <div className="grid grid-cols-2 gap-3">
            <input type="tel" className="input" placeholder="Phone Number" value={form.phone} onChange={set('phone')} maxLength={10} />
            <input type="date" className="input text-white/70" value={form.dob} onChange={set('dob')} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <select className="select" value={form.gender} onChange={set('gender')}>
              <option value="Prefer not to say">Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <select className="select" value={form.yearOfStudy} onChange={set('yearOfStudy')}>
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
            <select className="select" value={form.semester} onChange={set('semester')}>
              <option value="">Semester</option>
              {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
            </select>
          </div>

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
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2"><Lock size={16} className="text-ink-400" />Change Password</h2>
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
        <button onClick={handleLogout} className="btn-danger">
          <LogOut size={15} />
          Sign out of all devices
        </button>
      </motion.div>
    </div>
  )
}
