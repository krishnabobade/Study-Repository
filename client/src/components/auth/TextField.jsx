import { forwardRef } from 'react'
import { AlertCircle } from 'lucide-react'

const TextField = forwardRef(({
  id,
  name,
  label,
  type = 'text',
  placeholder,
  error,
  icon: Icon,
  disabled,
  autoComplete,
  inputMode,
  ...rest
}, ref) => {
  const errorId = error ? `${id}-error` : undefined

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label htmlFor={id} className="text-xs sm:text-sm font-medium text-text-main">
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        {Icon && (
          <Icon
            size={20}
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${
              error ? 'text-red-400' : 'text-text-muted/40'
            }`}
          />
        )}
        <input
          ref={ref}
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          inputMode={inputMode}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          className={`w-full h-12 ${Icon ? 'pl-11' : 'px-4'} pr-4 rounded-xl bg-card border text-text-main text-base sm:text-sm placeholder:text-text-muted/40 focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
            error
              ? 'border-red-500/60 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
              : 'border-border hover:border-white/16 focus:border-ink-500 focus:ring-4 focus:ring-ink-500/25'
          }`}
          {...rest}
        />
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

TextField.displayName = 'TextField'
export default TextField
