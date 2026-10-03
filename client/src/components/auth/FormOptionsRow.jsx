import { memo } from 'react'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'

const FormOptionsRow = memo(({ remember, onRememberChange, disabled }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 my-1 min-h-[44px]">
      <label className="inline-flex items-center gap-2.5 cursor-pointer select-none py-2 group">
        <div className="relative flex items-center justify-center shrink-0">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => onRememberChange(e.target.checked)}
            disabled={disabled}
            className="sr-only peer"
          />
          <div
            className={`w-[18px] h-[18px] rounded-[5px] border transition-all duration-150 flex items-center justify-center peer-focus-visible:ring-2 peer-focus-visible:ring-ink-500 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-card ${
              remember
                ? 'bg-ink-500 border-ink-500 text-white'
                : 'border-border bg-surface group-hover:border-text-muted/40'
            }`}
          >
            {remember && <Check size={13} strokeWidth={3} className="text-white" />}
          </div>
        </div>
        <span className="text-xs sm:text-sm text-text-muted group-hover:text-text-main transition-colors font-medium">
          Keep me signed in
        </span>
      </label>

      <Link
        to="/forgot-password"
        className="text-xs sm:text-sm text-ink-400 hover:text-ink-300 font-medium transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-500 rounded-md py-1.5 px-1"
      >
        Forgot password?
      </Link>
    </div>
  )
})

export default FormOptionsRow
