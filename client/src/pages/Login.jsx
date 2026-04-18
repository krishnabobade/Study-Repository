import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const isValidEmail = form.email === '' || form.email.toLowerCase().endsWith('@mitwpu.edu.in')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      return toast.error('Please fill in all fields')
    }
    if (!form.email.toLowerCase().endsWith('@mitwpu.edu.in')) {
      return toast.error('Only @mitwpu.edu.in email addresses are permitted')
    }
    
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-ink-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-ink-800/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md">

        {/* Card */}
        <div className="glass rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-ink-500 flex items-center justify-center mb-4 shadow-lg shadow-ink-500/30">
              <BookOpen size={26} className="text-white" />
            </div>
            <h1 className="font-display font-bold text-2xl text-white">Welcome back</h1>
            <p className="text-white/50 text-sm mt-1">Sign in to your Study Repository</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${!isValidEmail ? 'text-red-400' : 'text-white/30'}`} />
              <input type="email" placeholder="College email (@mitwpu.edu.in)" value={form.email}
                onChange={set('email')} required
                className={`input pl-11 transition-all ${!isValidEmail ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50' : ''}`} />
            </div>

            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
              <input type={showPass ? 'text' : 'password'} placeholder="Password" value={form.password}
                onChange={set('password')} required
                className="input pl-11 pr-11" />
              <button type="button" onClick={() => setShowPass(s => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-3 text-base mt-2">
              {loading
                ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <>Sign in <ArrowRight size={16} /></>
              }
            </button>
          </form>

          <p className="text-center text-sm text-white/40 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-ink-400 hover:text-ink-300 font-medium transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
