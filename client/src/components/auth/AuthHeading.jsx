import { memo } from 'react'

const AuthHeading = memo(({ title = "Welcome back", subtitle = "Sign in to access your notes, papers and resources." }) => {
  return (
    <div className="flex flex-col items-center text-center mb-4">
      <h1 className="font-display font-semibold text-xl sm:text-2xl sm:leading-[30px] text-text-main tracking-tight">
        {title}
      </h1>
      <p className="text-text-muted text-xs sm:text-sm leading-relaxed mt-1 max-w-sm">
        {subtitle}
      </p>
    </div>
  )
})

export default AuthHeading
