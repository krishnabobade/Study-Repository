import { useState, memo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Mail, Lock, Eye, EyeOff, ArrowRight, Book, FileText, GraduationCap, Globe, Code, PenTool, Layout, Box, Server, BookCopy, Monitor, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'

import AnimatedBackground from '../components/AnimatedBackground'
import ThemeToggle from '../components/shared/ThemeToggle'
import SEO from '../components/shared/SEO'

const LoginForm = () => {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [consentAccepted, setConsentAccepted] = useState(false)
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
    if (!consentAccepted) {
      return toast.error('You must accept Terms & Conditions to continue.')
    }
    
    setLoading(true)
    try {
      await login(form.email, form.password, consentAccepted)
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
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full max-w-md relative z-10 transform-gpu"
    >
      <div className="glass rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-ink-500 flex items-center justify-center mb-4 shadow-lg shadow-ink-500/30">
            <BookOpen size={26} className="text-text-main" />
          </div>
          <h1 className="font-display font-bold text-2xl text-text-main">Welcome back</h1>
          <p className="text-text-muted text-sm mt-1">Sign in to your Study Repository</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${!isValidEmail ? 'text-red-400' : 'text-text-muted/30'}`} />
            <input type="email" placeholder="College email (@mitwpu.edu.in)" value={form.email}
              onChange={set('email')} required
              className={`input pl-11 transition-all ${!isValidEmail ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50' : ''}`} />
          </div>

          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/30 pointer-events-none" />
            <input type={showPass ? 'text' : 'password'} placeholder="Password" value={form.password}
              onChange={set('password')} required
              className="input pl-11 pr-11" />
            <button type="button" onClick={() => setShowPass(s => !s)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted/40 hover:text-text-main transition-colors">
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div className="flex justify-end mt-1">
            <Link to="/forgot-password" className="text-sm text-ink-400 hover:text-ink-300 font-medium transition-colors">
              Forgot password?
            </Link>
          </div>

          <div className="flex items-start gap-3 mt-4 mb-2">
            <div className="flex items-center h-5 mt-0.5">
              <input
                id="consent"
                type="checkbox"
                checked={consentAccepted}
                onChange={(e) => setConsentAccepted(e.target.checked)}
                className="w-4 h-4 rounded border-border bg-surface text-ink-500 focus:ring-ink-500/50 cursor-pointer"
              />
            </div>
            <label htmlFor="consent" className="text-xs text-text-muted leading-relaxed cursor-pointer select-none">
              I agree to the <Link to="/terms" className="text-ink-400 hover:text-ink-300 font-medium hover:underline">Terms & Conditions</Link> and <Link to="/privacy-policy" className="text-ink-400 hover:text-ink-300 font-medium hover:underline">Privacy Policy</Link> and accept the use of <Link to="/privacy-policy" className="text-ink-400 hover:text-ink-300 font-medium hover:underline">Cookies</Link>.
            </label>
          </div>

          <button 
            type="submit" 
            disabled={loading || !consentAccepted}
            className="btn-primary w-full justify-center py-3 text-base mt-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            onClick={(e) => {
              if (!consentAccepted) {
                e.preventDefault();
                toast.error('You must accept Terms & Conditions to continue.');
              }
            }}
          >
            {loading
              ? <span className="w-5 h-5 border-2 border-border border-t-white rounded-full animate-spin" />
              : <>Sign in <ArrowRight size={16} /></>
            }
          </button>
        </form>

        <p className="text-center text-sm text-text-muted/60 mt-6 mb-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-ink-400 hover:text-ink-300 font-medium transition-colors">
            Create one
          </Link>
        </p>

        <div className="pt-5 border-t border-white/5 flex items-center justify-center gap-6">
          <div className="flex items-center gap-1.5 text-xs text-text-muted/60" title="Secured with 256-bit encryption">
            <Lock size={14} className="text-green-500/70" />
            <span>Secure Login</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-muted/60" title="Official Institutional Portal">
            <ShieldCheck size={14} className="text-blue-500/70" />
            <span>Verified Portal</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function Login() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 relative overflow-hidden">
      <SEO title="Login | Study Repository" description="Sign in to your Study Repository account to access premium academic resources." />
      
      <div className="absolute inset-0 z-0">
        <AnimatedBackground />
      </div>

      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* 3. Extracted Form Container */}
      <LoginForm />
    </div>
  )
}
