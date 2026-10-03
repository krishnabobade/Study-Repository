import { memo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import ThemeToggle from '../shared/ThemeToggle'

const TopBar = memo(() => {
  return (
    <header className="w-full h-16 px-4 sm:px-8 flex items-center justify-between absolute top-0 left-0 right-0 z-50 pointer-events-auto">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs sm:text-sm text-text-muted hover:text-text-main font-medium transition-colors p-2 rounded-xl hover:bg-card/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-500"
      >
        <ArrowLeft size={16} />
        <span>Back to home</span>
      </Link>

      <div className="flex items-center">
        <ThemeToggle />
      </div>
    </header>
  )
})

export default TopBar
