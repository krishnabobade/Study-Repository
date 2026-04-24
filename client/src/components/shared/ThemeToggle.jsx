import { Sun, Moon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useThemeStore from '../../store/themeStore'

export default function ThemeToggle() {
  const { mode, toggleTheme } = useThemeStore()

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-xl bg-panel border border-border text-text-muted hover:text-text-main transition-all group overflow-hidden"
      title={mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <div className="relative z-10">
        <AnimatePresence mode="wait" initial={false}>
          {mode === 'dark' ? (
            <motion.div
              key="moon"
              initial={{ y: 20, opacity: 0, rotate: -45 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: -20, opacity: 0, rotate: 45 }}
              transition={{ duration: 0.2, ease: "backOut" }}
            >
              <Moon size={18} />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ y: 20, opacity: 0, rotate: -45 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: -20, opacity: 0, rotate: 45 }}
              transition={{ duration: 0.2, ease: "backOut" }}
            >
              <Sun size={18} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Subtle glow effect on hover */}
      <div className="absolute inset-0 bg-ink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  )
}
