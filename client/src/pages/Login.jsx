import { useState, memo, useCallback, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'

import AnimatedBackground from '../components/AnimatedBackground'
import ThemeToggle from '../components/shared/ThemeToggle'
import SEO from '../components/shared/SEO'

const LoginForm = memo(() => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [consentAccepted, setConsentAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleEmailChange = useCallback((e) => setEmail(e.target.value), [])
  const handlePasswordChange = useCallback((e) => setPassword(e.target.value), [])
  const toggleShowPass = useCallback(() => setShowPass(prev => !prev), [])
  const handleConsentChange = useCallback((e) => setConsentAccepted(e.target.checked), [])

  const isValidEmail = useMemo(() => {
    return email === '' || email.toLowerCase().endsWith('@mitwpu.edu.in')
  }, [email])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    if (!email || !password) {
      return toast.error('Please fill in all fields')
    }
    if (!email.toLowerCase().endsWith('@mitwpu.edu.in')) {
      return toast.error('Only @mitwpu.edu.in email addresses are permitted')
    }
    if (!consentAccepted) {
      return toast.error('You must accept Terms & Conditions to continue.')
    }
    
    setLoading(true)
    try {
      await login(email, password, consentAccepted)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [email, password, consentAccepted, login, navigate])

  const handleDisabledSubmit = useCallback((e) => {
    if (!consentAccepted) {
      e.preventDefault();
      toast.error('You must accept Terms & Conditions to continue.');
    }
  }, [consentAccepted])

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full max-w-md relative z-10 transform-gpu"
    >
      <div className="glass rounded-3xl p-5 xs:p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col items-center mb-8">
          <h1 className="font-display font-bold text-2xl text-text-main">Welcome back</h1>
          <p className="text-text-muted text-sm mt-1">Sign in to your Study Repository</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${!isValidEmail ? 'text-red-400' : 'text-text-muted/30'}`} />
            <input type="email" placeholder="College email (@mitwpu.edu.in)" value={email}
              onChange={handleEmailChange} required
              className={`input pl-11 transition-all ${!isValidEmail ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50' : ''}`} />
          </div>

          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/30 pointer-events-none" />
            <input type={showPass ? 'text' : 'password'} placeholder="Password" value={password}
              onChange={handlePasswordChange} required
              className="input pl-11 pr-11" />
            <button type="button" onClick={toggleShowPass}
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
                onChange={handleConsentChange}
                className="checkbox"
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
            onClick={handleDisabledSubmit}
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
})

const Login = memo(() => {
  const loginSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Sign In - Study Repository",
    "description": "Access your academic study repository account to download and share course notes.",
    "publisher": {
      "@type": "EducationalOrganization",
      "name": "Study Repository",
      "logo": "https://study-repository-ten.vercel.app/logo.png"
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 relative overflow-hidden">
      <SEO 
        title="Login | Study Repository" 
        description="Sign in to your Study Repository account to access premium academic resources." 
        schema={loginSchema}
      />
      
      <div className="absolute inset-0 z-0">
        <AnimatedBackground />
      </div>

      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <LoginForm />
    </div>
  )
})

export default Login
