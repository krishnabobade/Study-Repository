import { useState, useCallback, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'

import AnimatedBackground from '../components/AnimatedBackground'
import SEO from '../components/shared/SEO'
import TopBar from '../components/auth/TopBar'
import AuthCard from '../components/auth/AuthCard'
import BrandLogo from '../components/auth/BrandLogo'
import AuthHeading from '../components/auth/AuthHeading'
import FormAlert from '../components/auth/FormAlert'
import TextField from '../components/auth/TextField'
import PasswordField from '../components/auth/PasswordField'
import FormOptionsRow from '../components/auth/FormOptionsRow'
import Button from '../components/auth/Button'
import Divider from '../components/auth/Divider'
import GoogleButton from '../components/auth/GoogleButton'
import SignupPrompt from '../components/auth/SignupPrompt'
import AuthFooter from '../components/auth/AuthFooter'
import { Mail, ShieldAlert } from 'lucide-react'

// Validation Schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Please enter your email address.' })
    .email({ message: 'Please enter a valid email address.' }),
  password: z
    .string()
    .min(1, { message: 'Please enter your password.' }),
  remember: z.boolean().default(true)
})

export default function Login() {
  // Status State Machine: 'idle' | 'submitting' | 'success' | 'error'
  const [status, setStatus] = useState('idle')
  const [formError, setFormError] = useState(null)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const [isShaking, setIsShaking] = useState(false)

  const { login } = useAuthStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Validate next param for same-origin relative path redirect safety
  const safeNextUrl = useMemo(() => {
    const rawNext = searchParams.get('next')
    if (rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') && !rawNext.startsWith('/\\')) {
      return rawNext
    }
    return '/dashboard'
  }, [searchParams])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setFocus,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      remember: true
    }
  })

  const rememberVal = watch('remember')

  const triggerShake = useCallback(() => {
    setIsShaking(true)
    setTimeout(() => setIsShaking(false), 350)
  }, [])

  const onSubmit = async (data) => {
    // If failed attempts >= 3 and CAPTCHA required but not checked
    if (failedAttempts >= 3 && !captchaVerified) {
      setFormError('Security verification required. Please complete the CAPTCHA check below.')
      triggerShake()
      return
    }

    setFormError(null)
    setStatus('submitting')

    try {
      await login(data.email, data.password, true)
      
      setStatus('success')
      toast.success('Signed in successfully!')

      // Wait ~400ms for check animation before navigating
      setTimeout(() => {
        navigate(safeNextUrl, { replace: true })
      }, 400)
    } catch (err) {
      setStatus('error')
      triggerShake()

      const newFailedCount = failedAttempts + 1
      setFailedAttempts(newFailedCount)

      // Clear password field & refocus password
      setValue('password', '')
      setTimeout(() => setFocus('password'), 50)

      if (!err.response) {
        setFormError("Can't connect. Check your internet connection and try again.")
      } else if (err.response.status === 401) {
        setFormError('Incorrect email or password. Try again or reset your password.')
      } else if (err.response.status === 429) {
        const msg = err.response.data?.message || 'Too many attempts. Try again in a few minutes.'
        setFormError(msg)
      } else if (err.response.status >= 500) {
        setFormError('Something went wrong on our end. Please try again in a moment.')
      } else {
        setFormError(err.response.data?.message || 'Login failed. Please try again.')
      }
    }
  }

  const structuredSchemaData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Sign in - Study Repository",
    "description": "Access your academic study repository account to download and share course notes.",
    "publisher": {
      "@type": "EducationalOrganization",
      "name": "Study Repository",
      "logo": "https://study-repository-ten.vercel.app/logo.png"
    }
  }

  return (
    <div className="min-h-[100dvh] bg-surface flex flex-col justify-between items-center relative overflow-x-hidden selection:bg-ink-500/20">
      <SEO
        title="Sign in | Study Repository"
        description="Sign in to your Study Repository account to access premium academic resources."
        schema={structuredSchemaData}
      />

      <AnimatedBackground />

      <TopBar />

      <main className="w-full flex-1 flex items-center justify-center p-4 pt-20 pb-8 sm:py-12 z-10">
        <AuthCard isShaking={isShaking}>
          <BrandLogo />
          
          <AuthHeading
            title="Welcome back"
            subtitle="Sign in to access your notes, papers and resources."
          />

          <FormAlert message={formError} />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <TextField
              id="email"
              label="Email"
              type="email"
              placeholder="you@college.edu"
              icon={Mail}
              autoComplete="email"
              inputMode="email"
              disabled={status === 'submitting' || status === 'success'}
              error={errors.email?.message}
              {...register('email')}
            />

            <PasswordField
              id="password"
              label="Password"
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={status === 'submitting' || status === 'success'}
              error={errors.password?.message}
              {...register('password')}
            />

            <FormOptionsRow
              remember={rememberVal}
              onRememberChange={(val) => setValue('remember', val)}
              disabled={status === 'submitting' || status === 'success'}
            />

            {/* Turnstile / CAPTCHA security badge after 3 failed attempts */}
            {failedAttempts >= 3 && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-center justify-between animate-fade-in my-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert size={16} className="text-amber-400 shrink-0" />
                  <span>Security Verification Required</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={captchaVerified}
                    onChange={(e) => setCaptchaVerified(e.target.checked)}
                    className="checkbox"
                  />
                  <span className="text-[11px] font-mono">I am human</span>
                </label>
              </div>
            )}

            <Button status={status} className="mt-6">
              Sign in
            </Button>

            <Divider label="or" />

            <GoogleButton />

            <SignupPrompt />
          </form>
        </AuthCard>
      </main>

      <AuthFooter />
    </div>
  )
}
