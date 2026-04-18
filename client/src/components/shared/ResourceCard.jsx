import { motion } from 'framer-motion'
import { Download, Eye, Star, Calendar, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { FileTypeBadge, CategoryBadge, Stars, formatSize, timeAgo } from './utils'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function ResourceCard({ resource, compact = false }) {
  const handleDownload = async (e) => {
    e.preventDefault()
    try {
      const { data } = await api.post(`/resources/${resource._id}/download`)
      window.open(data.fileUrl, '_blank')
    } catch {
      toast.error('Download failed')
    }
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="card p-4 hover:border-ink-500/40 transition-all duration-200 group">
      <Link to={`/resources/${resource._id}`} className="block">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="w-10 h-10 rounded-xl bg-ink-500/15 flex items-center justify-center shrink-0 group-hover:bg-ink-500/25 transition-colors">
            <FileIcon type={resource.fileType} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h3 className="text-sm font-semibold text-white truncate group-hover:text-ink-300 transition-colors">
                {resource.title}
              </h3>
              <div className="flex gap-1.5 shrink-0">
                <FileTypeBadge type={resource.fileType} />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap mb-2">
              <CategoryBadge category={resource.category} />
              <span className="text-xs text-white/40">{resource.subject}</span>
              <span className="text-xs text-white/30">Sem {resource.semester}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-white/40">
                <Link to={`/profile/${resource.uploadedBy?._id}`} className="flex items-center gap-1 hover:text-ink-400 transition-colors">
                  <User size={11} />
                  {resource.uploadedBy?.name || 'Unknown'}
                </Link>
                <span className="flex items-center gap-1">
                  <Calendar size={11} />
                  {timeAgo(resource.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-white/40">
                {resource.avgRating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star size={11} className="text-ink-400" />
                    {resource.avgRating.toFixed(1)}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Eye size={11} />
                  {resource.views}
                </span>
                <span className="flex items-center gap-1">
                  <Download size={11} />
                  {resource.downloads}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      <button onClick={handleDownload}
        className="mt-3 w-full py-2 rounded-xl bg-ink-500/10 hover:bg-ink-500/20 border border-ink-500/20 hover:border-ink-500/40
                   text-xs font-medium text-ink-300 flex items-center justify-center gap-1.5 transition-all duration-200">
        <Download size={13} />
        Download
      </button>
    </motion.div>
  )
}

function FileIcon({ type }) {
  const icons = {
    pdf:   { emoji: '📄', color: 'text-red-400' },
    doc:   { emoji: '📝', color: 'text-blue-400' },
    ppt:   { emoji: '📊', color: 'text-orange-400' },
    image: { emoji: '🖼️', color: 'text-green-400' },
    video: { emoji: '🎬', color: 'text-purple-400' },
    other: { emoji: '📎', color: 'text-white/40' },
  }
  const { emoji } = icons[type] || icons.other
  return <span className="text-lg leading-none">{emoji}</span>
}
