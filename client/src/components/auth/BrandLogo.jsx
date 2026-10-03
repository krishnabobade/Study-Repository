import { memo } from 'react'

const BrandLogo = memo(() => {
  return (
    <div className="flex flex-col items-center justify-center gap-2.5 mb-6">
      <img
        src="/logo.png"
        alt="Study Repository Logo"
        className="w-12 h-12 object-contain rounded-2xl shadow-md shrink-0"
      />
      <span className="font-display font-bold text-lg sm:text-xl text-text-main tracking-tight">
        Study Repository
      </span>
    </div>
  )
})

export default BrandLogo
