import { memo } from 'react'
import ThemeToggle from '../shared/ThemeToggle'

const TopBar = memo(() => {
  return (
    <header className="w-full h-14 sm:h-16 px-4 sm:px-8 flex items-center justify-end absolute top-0 left-0 right-0 z-50 pointer-events-auto">
      <div className="flex items-center">
        <ThemeToggle />
      </div>
    </header>
  )
})

export default TopBar
