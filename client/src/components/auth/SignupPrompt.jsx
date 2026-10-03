import { memo } from 'react'
import { Link } from 'react-router-dom'

const SignupPrompt = memo(() => {
  return (
    <p className="text-center text-xs sm:text-sm text-text-muted mt-4">
      Don't have an account?{' '}
      <Link
        to="/register"
        className="text-ink-400 hover:text-ink-300 font-semibold transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-500 rounded-md py-0.5 px-1"
      >
        Create one
      </Link>
    </p>
  )
})

export default SignupPrompt
