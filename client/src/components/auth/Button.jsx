import { memo } from 'react'
import { ArrowRight, Check } from 'lucide-react'

const Button = memo(({ status = 'idle', type = 'submit', children, className = '', ...rest }) => {
  const isSubmitting = status === 'submitting'
  const isSuccess = status === 'success'

  return (
    <button
      type={type}
      disabled={isSubmitting || isSuccess}
      className={`w-full h-12 rounded-xl bg-gradient-to-b from-ink-500 to-ink-600 hover:brightness-105 active:scale-[0.98] text-white font-semibold text-base flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(101,88,245,0.25)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-500 focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:opacity-75 disabled:cursor-not-allowed disabled:active:scale-100 ${className}`}
      {...rest}
    >
      {isSubmitting ? (
        <>
          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>Signing in...</span>
        </>
      ) : isSuccess ? (
        <>
          <Check size={20} className="text-white animate-scale-in" />
          <span>Signed in</span>
        </>
      ) : (
        <>
          <span>{children || 'Sign in'}</span>
          <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
        </>
      )}
    </button>
  )
})

export default Button
