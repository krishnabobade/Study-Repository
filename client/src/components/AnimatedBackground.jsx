import { memo } from 'react'

const AnimatedBackground = memo(() => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
      {/* Base radial gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-ink-500/10 via-transparent to-transparent" />
      
      {/* Soft static radial violet glow behind centered card (~12% opacity) */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] sm:w-[650px] sm:h-[650px] bg-ink-500/[0.12] rounded-full blur-[140px] transform-gpu" 
      />
    </div>
  )
})

export default AnimatedBackground
