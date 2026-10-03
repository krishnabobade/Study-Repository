import { memo } from 'react'
import { GraduationCap } from 'lucide-react'

const BrandLogo = memo(() => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 mb-3">
      <div className="w-9 h-9 rounded-xl bg-ink-500/15 border border-ink-500/30 flex items-center justify-center text-ink-400 shadow-sm shrink-0">
        <GraduationCap size={20} className="text-ink-400" />
      </div>
      <span className="font-display font-bold text-base sm:text-lg text-text-main tracking-tight">
        Study Repository
      </span>
    </div>
  )
})

export default BrandLogo
