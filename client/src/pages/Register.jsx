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

const PRESET_AVATARS = [
  { id: 'avatar_1', url: '/avatars/avatar_1.jpg', label: 'Avatar 1' },
  { id: 'avatar_2', url: '/avatars/avatar_2.jpg', label: 'Avatar 2' },
  { id: 'avatar_3', url: '/avatars/avatar_3.jpg', label: 'Avatar 3' },
  { id: 'avatar_4', url: '/avatars/avatar_4.jpg', label: 'Avatar 4' },
  { id: 'avatar_5', url: '/avatars/avatar_5.jpg', label: 'Avatar 5' },
  { id: 'avatar_6', url: '/avatars/avatar_6.jpg', label: 'Avatar 6' }
];

const RegisterForm = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ 
    firstName: '', surname: '', email: '', password: '', role: 'student',
    phone: '', dob: '', gender: 'Prefer not to say',
    collegeName: 'MIT World Peace University', course: '', semester: '', yearOfStudy: '', bio: '' 
  });
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreset, setAvatarPreset] = useState('')
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
      if (!form.firstName || !form.surname || !form.email || !form.password) return toast.error('Please fill required fields.');
      if (!isValidEmail) return toast.error('Only @mitwpu.edu.in email addresses are permitted.');
      if (form.role === 'student' && !isValidPassword) return toast.error('Please meet all password requirements.');
      if (!consentAccepted) return toast.error('You must accept Terms & Conditions to continue.');
      setStep(2);
    } else if (step === 2) {
      if (form.phone && form.phone.length !== 10) return toast.error('Phone number must be exactly 10 digits.');
      if (!form.dob) return toast.error('Date of birth is required.');
      if (!avatarFile && !avatarPreset) return toast.error('Please select an identity avatar or upload a custom picture to continue.');
      
      const birthDate = new Date(form.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 18) {
        return toast.error('You must be at least 18 years old to use this website.');
      }
      
      setStep(3);
    }
  }

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    
    if (form.role !== 'super_admin' && step < 3) return;
    if (!consentAccepted) return toast.error('You must accept Terms & Conditions to continue.');
    if (form.role !== 'super_admin' && (!form.course || !form.semester || !form.yearOfStudy)) return toast.error('Academic details are required.')
    if (form.role !== 'super_admin' && !avatarFile && !avatarPreset) return toast.error('Please select or upload a profile picture.');

    setLoading(true)
    try {
      const fd = new FormData();
      const submissionForm = {
        ...form,
        name: `${form.firstName.trim()} ${form.surname.trim()}`
      };
      delete submissionForm.firstName;
      delete submissionForm.surname;

      Object.entries(submissionForm).forEach(([k,v]) => {
        if (v !== null && v !== '') fd.append(k, v);
      });
      fd.append('consentAccepted', consentAccepted);
      if (avatarFile) {
        fd.append('avatar', avatarFile);
      } else if (avatarPreset) {
        fd.append('avatar', avatarPreset);
      }

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
      <div className="glass rounded-3xl p-5 xs:p-8 shadow-2xl overflow-y-auto max-h-[85vh] custom-scrollbar backdrop-blur-xl">
        
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-ink-500/10 flex items-center justify-center mb-4 shadow-lg shadow-ink-500/30 overflow-hidden border border-ink-500/20">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
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
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/40" />
                    <input type="text" placeholder="First name *" value={form.firstName}
                      onChange={set('firstName')} required className="input pl-11" />
                  </div>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/40" />
                    <input type="text" placeholder="Surname *" value={form.surname}
                      onChange={set('surname')} required className="input pl-11" />
                  </div>
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
                    <option value="super_admin">Admin</option>
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
                      className="checkbox"
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
              <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                
                {/* Live Preview Header */}
                <div className="flex flex-col items-center justify-center pt-2">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full bg-panel border-2 border-ink-500 flex items-center justify-center overflow-hidden shadow-[0_8px_30px_rgb(99,102,241,0.2)] transition-all duration-300 group-hover:scale-105">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center text-text-muted">
                          <User size={36} className="opacity-40 text-text-muted" />
                          <span className="text-[10px] mt-1 font-semibold uppercase tracking-wider">No Identity</span>
                        </div>
                      )}
                    </div>
                    {avatarPreview && (
                      <button 
                        type="button"
                        onClick={() => {
                          setAvatarFile(null);
                          setAvatarPreset('');
                          setAvatarPreview('');
                        }}
                        className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500/90 text-white flex items-center justify-center hover:bg-red-600 transition-all shadow-md active:scale-95"
                        title="Remove selection"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                  <div className="text-center mt-3">
                    <p className="text-sm font-semibold text-text-main">Choose Your Profile Identity</p>
                    <p className="text-xs text-text-muted mt-0.5">Every account requires an avatar or custom photo *</p>
                  </div>
                </div>

                {/* Selection Options */}
                <div className="space-y-4">
                  {/* Option 1: Custom Photo Upload */}
                  <div className="bg-panel border border-border rounded-2xl p-4">
                    <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-3">Option 1: Upload Custom Image</span>
                    
                    <label className="flex items-center justify-center gap-3 border border-dashed border-border hover:border-ink-500/50 hover:bg-white/[0.01] transition-all rounded-xl p-4 cursor-pointer group">
                      <Camera size={20} className="text-text-muted group-hover:text-ink-400 transition-colors" />
                      <div className="text-left">
                        <span className="text-sm font-medium text-text-main block">Choose from device</span>
                        <span className="text-[11px] text-text-muted block">JPG, PNG or WEBP. Max 2MB.</span>
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </label>
                  </div>

                  {/* Option 2: Select Preset Avatar */}
                  <div className="bg-panel border border-border rounded-2xl p-4">
                    <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-3">Option 2: Select Avatar</span>
                    
                    <div className="flex gap-3 overflow-x-auto py-2 scrollbar-thin snap-x">
                      {PRESET_AVATARS.map(avatar => {
                        const isSelected = avatarPreset === avatar.url;
                        return (
                          <button
                            key={avatar.id}
                            type="button"
                            onClick={() => handleSelectPreset(avatar.url)}
                            className={`relative rounded-2xl border p-2.5 flex flex-col items-center justify-center group transition-all cursor-pointer shrink-0 snap-start ${
                              isSelected 
                                ? 'bg-ink-500/10 border-ink-500 shadow-[0_0_15px_rgba(99,102,241,0.15)] scale-102' 
                                : 'bg-surface/50 border-border hover:border-text-muted/30 hover:scale-101'
                            }`}
                          >
                            {/* Inner circle wrapper */}
                            <div className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-all ${
                              isSelected ? 'border-ink-500' : 'border-transparent group-hover:border-border'
                            }`}>
                              <img src={avatar.url} alt={avatar.label} className="w-full h-full object-cover" />
                            </div>

                            {isSelected && (
                              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-ink-500 text-white flex items-center justify-center shadow-md">
                                <Check size={10} className="stroke-[3]" />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
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
                    <input 
                      type="date" 
                      value={form.dob} 
                      onChange={set('dob')} 
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                      required
                      className="input pl-11 text-text-muted" 
                    />
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
                  <select 
                    value={form.yearOfStudy} 
                    onChange={(e) => setForm(f => ({ ...f, yearOfStudy: e.target.value, semester: '' }))} 
                    required 
                    className="select text-sm"
                  >
                    <option value="">Year of Study *</option>
                    {[1,2,3,4].map(s => <option key={s} value={s}>Year {s}</option>)}
                  </select>
                </div>

                <select 
                  value={form.semester} 
                  onChange={set('semester')} 
                  required 
                  className="select"
                  disabled={!form.yearOfStudy}
                >
                  <option value="">{form.yearOfStudy ? "Semester" : "Select Year First"}</option>
                  {form.yearOfStudy && [parseInt(form.yearOfStudy) * 2 - 1, parseInt(form.yearOfStudy) * 2].map(s => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
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
  const registerSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Register - Study Repository",
    "description": "Create a student account on the academic study repository to start sharing, organizing, and collaborating on learning materials.",
    "publisher": {
      "@type": "EducationalOrganization",
      "name": "Study Repository",
      "logo": "https://study-repository-ten.vercel.app/logo.png"
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 relative overflow-hidden py-12">
      <SEO 
        title="Create Account | Study Repository" 
        description="Join the premium academic repository for students to share, discover, and download high-quality study materials." 
        schema={registerSchema}
      />
      <AnimatedBackground />
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>
      <RegisterForm />
    </div>
  )
}
