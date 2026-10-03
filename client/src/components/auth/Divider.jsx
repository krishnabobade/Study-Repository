import { memo } from 'react'

const Divider = memo(({ label = 'or' }) => {
  return (
    <div className="relative flex items-center justify-center my-4">
      <div className="w-full border-t border-border" />
      <span className="absolute bg-card px-3 text-[11px] text-text-muted/60 uppercase tracking-wider font-mono">
        {label}
      </span>
    </div>
  )
})

export default Divider
