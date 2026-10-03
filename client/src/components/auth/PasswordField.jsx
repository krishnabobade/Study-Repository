import { forwardRef, useState } from 'react'
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'

const PasswordField = forwardRef(({
  id = 'password',
  name = 'password',
  label = 'Password',
  placeholder = '••••••••',
  error,
  disabled,
  autoComplete = 'current-password',
  ...rest
}, ref) => {
  const [showPass, setShowPass] = useState(false)
  const [capsLock, setCapsLock] = useState(false)
  const errorId = error ? `${id}-error` : undefined

  const handleKeyDown = (e) => {
    if (e.getModifierState) {
      setCapsLock(e.getModifierState('CapsLock'))
    }
  }

  const handleKeyUp = (e) => {
    if (e.getModifierState) {
      setCapsLock(e.getModifierState('CapsLock'))
    }
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <label htmlFor={id} className="text-xs sm:text-sm font-medium text-text-main flex items-center justify-between">
        <span>{label}</span>
        {capsLock && (
          <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            Caps Lock ON
          </span>
        )}
      </label>
      <div className="relative flex items-center w-full">
        <Lock
          size={20}
          className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${
            error ? 'text-red-400' : 'text-text-muted/40'
          }`}
        />
        <input
          ref={ref}
          id={id}
          name={name}
          type={showPass ? 'text' : 'password'}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          className={`w-full h-12 pl-11 pr-11 rounded-xl bg-card border text-text-main text-base sm:text-sm placeholder:text-text-muted/40 focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
            error
              ? 'border-red-500/60 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
              : 'border-border hover:border-white/16 focus:border-ink-500 focus:ring-4 focus:ring-ink-500/25'
          }`}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setShowPass(!showPass)}
          aria-label={showPass ? 'Hide password' : 'Show password'}
          aria-pressed={showPass}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted/40 hover:text-text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-500 rounded-md p-1 transition-colors"
        >
          {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && (
        <p id={errorId} className="text-xs sm:text-[13px] text-red-400 font-medium flex items-center gap-1.5 mt-0.5 animate-fade-in">
          <AlertCircle size={14} className="shrink-0 text-red-400" />
          <span>{error}</span>
        </p>
      )}
    </div>
  )
})

PasswordField.displayName = 'PasswordField'
export default PasswordField
