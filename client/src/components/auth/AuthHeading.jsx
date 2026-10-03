import { memo } from 'react'

const AuthHeading = memo(({ title = "Welcome back", subtitle = "Sign in to access your notes, papers and resources." }) => {
  return (
    <div className="flex flex-col items-center text-center mb-6">
      <h1 className="font-display font-semibold text-2xl sm:text-[28px] sm:leading-[34px] text-text-main tracking-tight">
        {title}
      </h1>
      <p className="text-text-muted text-sm sm:text-[15px] leading-relaxed mt-2 max-w-sm">
        {subtitle}
      </p>
    </div>
  )
})

export default AuthHeading
