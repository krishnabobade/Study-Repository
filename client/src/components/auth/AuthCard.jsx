import { memo } from 'react'
import { motion } from 'framer-motion'

const AuthCard = memo(({ children, isShaking }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={
        isShaking
          ? { x: [0, -6, 6, -6, 6, 0], opacity: 1, y: 0 }
          : { opacity: 1, y: 0 }
      }
      transition={
        isShaking
          ? { duration: 0.3 }
          : { duration: 0.25, ease: 'easeOut' }
      }
      className="w-full max-w-[440px] rounded-[20px] p-5 sm:p-7 md:p-8 bg-card border border-white/[0.08] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)] relative z-10 my-auto transform-gpu"
    >
      {children}
    </motion.div>
  )
})

export default AuthCard
