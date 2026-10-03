import { memo } from 'react'
import { GraduationCap } from 'lucide-react'

const BrandLogo = memo(() => {
  return (
    <div className="flex flex-col items-center justify-center gap-2.5 mb-6">
      <div className="w-10 h-10 rounded-xl bg-ink-500/15 border border-ink-500/30 flex items-center justify-center text-ink-400 shadow-sm shrink-0">
        <GraduationCap size={22} className="text-ink-400" />
      </div>
      <span className="font-display font-bold text-lg sm:text-xl text-text-main tracking-tight">
        Study Repository
      </span>
    </div>
  )
})

export default BrandLogo
