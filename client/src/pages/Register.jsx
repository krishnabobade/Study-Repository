import { useState, useMemo, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Mail, Lock, User, GraduationCap, Eye, EyeOff, Check, X, Camera, Phone, Calendar, Building, FileText, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import { MITWPU_SCHOOLS } from '../data/mitwpu'
import AnimatedBackground from '../components/AnimatedBackground'
import ThemeToggle from '../components/shared/ThemeToggle'
import SEO from '../components/shared/SEO'

const RegisterForm = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ 
    name: '', email: '', password: '', role: 'student',
    phone: '', dob: '', gender: 'Prefer not to say',
    collegeName: 'MIT World Peace University', course: '', semester: '', yearOfStudy: '', bio: '' 
  });
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  
  const [showPass, setShowPass] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [consentAccepted, setConsentAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const { register } = useAuthStore()
  const navigate = useNavigate()

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleAvatarChange = e => {
    const f = e.target.files[0]
    if (!f) return
    setAvatarFile(f)
    setAvatarPreview(URL.createObjectURL(f))
  }

  const passwordCriteria = useMemo(() => [
    { id: 'length', label: '8+ characters', valid: form.password.length >= 8 },
    { id: 'upper', label: 'Uppercase letter', valid: /[A-Z]/.test(form.password) },
    { id: 'lower', label: 'Lowercase letter', valid: /[a-z]/.test(form.password) },
    { id: 'num', label: 'Number', valid: /\d/.test(form.password) },
    { id: 'special', label: 'Special character', valid: /[^a-zA-Z\d]/.test(form.password) },
  ], [form.password])

  const isValidPassword = passwordCriteria.every(c => c.valid)
  const isValidEmail = form.email === '' || form.email.toLowerCase().endsWith('@mitwpu.edu.in')

  const nextStep = (e) => {
    if (step === 1) {
      if (!form.name || !form.email || !form.password) return toast.error('Please fill required fields.');
      if (!isValidEmail) return toast.error('Only @mitwpu.edu.in email addresses are permitted.');
      if (form.role === 'student' && !isValidPassword) return toast.error('Please meet all password requirements.');
      if (!consentAccepted) return toast.error('You must accept Terms & Conditions to continue.');
      setStep(2);
    } else if (step === 2) {
      if (form.phone && form.phone.length !== 10) return toast.error('Phone number must be exactly 10 digits.');
      setStep(3);
    }
  }

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    
    if (form.role !== 'super_admin' && step < 3) return;
    if (!consentAccepted) return toast.error('You must accept Terms & Conditions to continue.');
    if (form.role !== 'super_admin' && (!form.course || !form.semester || !form.yearOfStudy)) return toast.error('Academic details are required.')

    setLoading(true)
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => {
        if (v !== null && v !== '') fd.append(k, v);
      });
      if (avatarFile) fd.append('avatar', avatarFile);

      await register(fd)
      toast.success('Account created! Welcome 🎉')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-lg relative z-10 transform-gpu"
    >
      <div className="glass rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[85vh] custom-scrollbar backdrop-blur-xl">
        
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-ink-500 flex items-center justify-center mb-4 shadow-lg shadow-ink-500/30">
            <BookOpen size={26} className="text-text-main" />
          </div>
          <h1 className="font-display font-bold text-2xl text-text-main">Create Account</h1>
          <p className="text-text-muted text-sm mt-1">
            Step {step} of 3: {step === 1 ? 'Core Setup' : step === 2 ? 'Personal Details' : 'Academic Profile'}
          </p>
        </div>

        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors duration-300 ${step >= i ? 'bg-ink-400' : 'bg-panel border border-border'}`} />
          ))}
        </div>

        <form onSubmit={(step === 3 || form.role === 'super_admin') ? handleSubmit : (e) => { e.preventDefault(); nextStep(e); }} className="space-y-4">
          
          <AnimatePresence mode='wait'>
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/40" />
                  <input type="text" placeholder="Full name *" value={form.name}
                    onChange={set('name')} required className="input pl-11" />
                </div>

                <div className="relative">
                  <Mail size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${form.email && !form.email.toLowerCase().endsWith('@mitwpu.edu.in') ? 'text-red-400' : 'text-text-muted'}`} />
                  <input type="email" placeholder="College email (@mitwpu.edu.in) *" value={form.email}
                    onChange={set('email')} required 
                    className={`input pl-11 transition-all ${form.email && !form.email.toLowerCase().endsWith('@mitwpu.edu.in') ? 'border-red-500/50 focus:border-red-500' : ''}`} />
                </div>

                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/40" />
                  <select value={form.role} onChange={set('role')} required className="select pl-11">
                    <option value="student">Student</option>
                    <option value="teacher">Faculty Member</option>
                  </select>
                </div>

                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input 
                    type={showPass ? 'text' : 'password'} 
                    placeholder="Password *" 
                    value={form.password}
                    onChange={set('password')} 
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    required 
                    className="input pl-11 pr-11" 
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted/60 hover:text-text-main transition-colors">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div className="flex items-start gap-3 mt-4 mb-2">
                  <div className="flex items-center h-5 mt-0.5">
                    <input
                      id="register-consent"
                      type="checkbox"
                      checked={consentAccepted}
                      onChange={(e) => setConsentAccepted(e.target.checked)}
                      className="w-4 h-4 rounded border-border bg-surface text-ink-500 focus:ring-ink-500/50 cursor-pointer"
                    />
                  </div>
                  <label htmlFor="register-consent" className="text-xs text-text-muted leading-relaxed cursor-pointer select-none">
                    I agree to the <Link to="/terms" className="text-ink-400 hover:text-ink-300 font-medium hover:underline">Terms & Conditions</Link> and <Link to="/privacy-policy" className="text-ink-400 hover:text-ink-300 font-medium hover:underline">Privacy Policy</Link> and accept the use of <Link to="/privacy-policy" className="text-ink-400 hover:text-ink-300 font-medium hover:underline">Cookies</Link>.
                  </label>
                </div>

                <AnimatePresence>
                  {form.role === 'student' && (isFocused || form.password.length > 0) && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="bg-panel border border-border rounded-xl p-3 grid grid-cols-2 gap-y-2 gap-x-1 text-[11px] sm:text-xs">
                      {passwordCriteria.map(c => (
                        <div key={c.id} className={`flex items-center gap-1.5 transition-colors duration-300 ${c.valid ? 'text-green-400' : 'text-text-muted/40'}`}>
                          {c.valid ? <Check size={12} className="shrink-0" /> : <X size={12} className="shrink-0" />}
                          <span>{c.label}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                <div className="flex items-center gap-4 mb-2">
                  <div className="relative group shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-ink-700 flex items-center justify-center overflow-hidden ring-2 ring-border group-hover:ring-ink-500 transition-all">
                      {avatarPreview ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" /> : <User size={24} className="text-text-muted" />}
                    </div>
                    <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-ink-500 flex items-center justify-center cursor-pointer hover:bg-ink-400 transition-colors shadow-lg">
                      <Camera size={13} className="text-text-main" />
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </label>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-main shadow-sm">Profile Picture</p>
                    <p className="text-xs text-text-muted">Optional. Max 2MB.</p>
                  </div>
                </div>

                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input type="tel" placeholder="Phone Number" value={form.phone}
                    onChange={set('phone')} maxLength={10} className="input pl-11" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input type="date" value={form.dob} onChange={set('dob')} className="input pl-11 text-text-muted" />
                  </div>
                  <select value={form.gender} onChange={set('gender')} className="select">
                    <option value="Prefer not to say">Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                <div className="relative">
                  <Building size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input type="text" placeholder="College Name" value={form.collegeName}
                    onChange={set('collegeName')} readOnly className="input pl-11 opacity-70 cursor-not-allowed" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <GraduationCap size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <select value={form.course} onChange={set('course')} required className="select pl-10 text-sm">
                      <option value="">Course *</option>
                      {MITWPU_SCHOOLS.map(school => (
                        <optgroup key={school.name} label={school.name}>
                          {school.courses.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                  <select value={form.yearOfStudy} onChange={set('yearOfStudy')} required className="select text-sm">
                    <option value="">Year of Study *</option>
                    {[1,2,3,4].map(s => <option key={s} value={s}>Year {s}</option>)}
                  </select>
                </div>

                <select value={form.semester} onChange={set('semester')} required className="select">
                  <option value="">Semester *</option>
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>

                <div className="relative">
                  <FileText size={16} className="absolute left-4 top-4 text-text-muted" />
                  <textarea placeholder="Short Bio / About me" value={form.bio}
                    onChange={set('bio')} maxLength={300} className="input pl-11 h-24 resize-none" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-3 pt-2">
            {step > 1 && (
              <button type="button" onClick={prevStep} className="btn-ghost flex-1 justify-center py-3">
                <ChevronLeft size={18} /> Back
              </button>
            )}
            {(step < 3 && form.role !== 'super_admin') ? (
              <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-3">
                Next <ChevronRight size={18} />
              </button>
            ) : (
              <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-3">
                {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Complete Setup'}
              </button>
            )}
          </div>

        </form>

        {step === 1 && (
          <>
            <p className="text-center text-sm text-text-muted/60 mt-6 mb-6">
              Already have an account?{' '}
              <Link to="/login" className="text-ink-400 hover:text-ink-300 font-medium transition-colors">Sign in</Link>
            </p>
            <div className="pt-5 border-t border-white/5 flex items-center justify-center gap-6">
              <div className="flex items-center gap-1.5 text-xs text-text-muted/60" title="Secured with 256-bit encryption">
                <Lock size={14} className="text-green-500/70" />
                <span>Secure Signup</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-text-muted/60" title="Official Institutional Portal">
                <ShieldCheck size={14} className="text-blue-500/70" />
                <span>Verified Portal</span>
              </div>
            </div>
          </>
        )}

      </div>
    </motion.div>
  )
}

export default function Register() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 relative overflow-hidden py-12">
      <SEO title="Create Account | Study Repository" description="Join the premium academic repository for students to share, discover, and download high-quality study materials." />
      <AnimatedBackground />
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>
      <RegisterForm />
    </div>
  )
}
