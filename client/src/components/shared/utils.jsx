// Skeleton loader
export function Skeleton({ className = '' }) {
  return <div className={`shimmer-bg rounded-xl bg-white/5 ${className}`} />
}

// File type badge
export function FileTypeBadge({ type }) {
  const map = {
    pdf:   { label: 'PDF',   cls: 'bg-red-500/15 text-red-400' },
    doc:   { label: 'DOC',   cls: 'bg-blue-500/15 text-blue-400' },
    ppt:   { label: 'PPT',   cls: 'bg-orange-500/15 text-orange-400' },
    image: { label: 'IMG',   cls: 'bg-green-500/15 text-green-400' },
    video: { label: 'VID',   cls: 'bg-purple-500/15 text-purple-400' },
    other: { label: 'FILE',  cls: 'bg-white/10 text-white/50' },
  }
  const { label, cls } = map[type] || map.other
  return <span className={`badge ${cls} font-mono text-[10px]`}>{label}</span>
}

// Category badge
export function CategoryBadge({ category }) {
  const map = {
    notes:      { label: 'Notes',      cls: 'bg-ink-500/20 text-ink-300' },
    qpaper:     { label: 'Q. Paper',   cls: 'bg-yellow-500/15 text-yellow-400' },
    assignment: { label: 'Assignment', cls: 'bg-cyan-500/15 text-cyan-400' },
    lab:        { label: 'Lab Manual', cls: 'bg-orange-500/15 text-orange-400' },
    formula:    { label: 'Formula',    cls: 'bg-pink-500/15 text-pink-400' },
    project:    { label: 'Project',    cls: 'bg-green-500/15 text-green-400' },
    other:      { label: 'Other',      cls: 'bg-white/10 text-white/50' },
  }
  const { label, cls } = map[category] || map.other
  return <span className={`badge ${cls}`}>{label}</span>
}

// Star rating display
export function Stars({ rating = 0, size = 12 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= Math.round(rating) ? '#6558f5' : 'transparent'}
          stroke={i <= Math.round(rating) ? '#6558f5' : '#ffffff30'} strokeWidth={2}>
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
    </div>
  )
}

// File size formatter
export function formatSize(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

// Time ago
export function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString()
}
