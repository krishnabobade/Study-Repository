import { memo } from 'react'
import { AlertCircle } from 'lucide-react'

const FormAlert = memo(({ message }) => {
  if (!message) return null

  return (
    <div
      role="alert"
      className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm flex items-start gap-2.5 animate-fade-in"
    >
      <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-400" />
      <div className="flex-1 leading-snug font-medium">
        {message}
      </div>
    </div>
  )
})

export default FormAlert
