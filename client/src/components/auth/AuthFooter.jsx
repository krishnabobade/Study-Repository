import { memo } from 'react'
import { Link } from 'react-router-dom'

const AuthFooter = memo(() => {
  return (
    <footer className="w-full py-6 px-4 text-center text-xs sm:text-[13px] text-text-muted/60 flex flex-wrap items-center justify-center gap-2 sm:gap-4 relative z-10">
      <span>© 2026 Study Repository</span>
      <span className="opacity-40">·</span>
      <Link to="/privacy-policy" className="hover:text-text-main transition-colors hover:underline">
        Privacy
      </Link>
      <span className="opacity-40">·</span>
      <Link to="/terms" className="hover:text-text-main transition-colors hover:underline">
        Terms
      </Link>
      <span className="opacity-40">·</span>
      <Link to="/help-center" className="hover:text-text-main transition-colors hover:underline">
        Help
      </Link>
    </footer>
  )
})

export default AuthFooter
