import { motion } from 'framer-motion'
import { Download, Eye, Star, Calendar, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { FileTypeBadge, CategoryBadge, Stars, formatSize, timeAgo, forceDownloadBlob } from './utils'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { useState } from 'react'
import useAuthStore from '../../store/authStore'

export default function ResourceCard({ resource, compact = false }) {
  const { refreshUser } = useAuthStore()
  const [localViews, setLocalViews] = useState(resource.views)
  const [localDownloads, setLocalDownloads] = useState(resource.downloads)

  const handleDownloadClick = async (e) => {
    e.preventDefault()
    const toastId = toast.loading('Preparing download...')
    const success = await forceDownloadBlob(resource.fileUrl, resource.title, resource.fileType)
    if (success) {
      api.post(`/resources/${resource._id}/download`).catch(() => {})
      setLocalDownloads(d => d + 1)
      refreshUser() // Update global stats in sidebar
      toast.success('Download complete!', { id: toastId })
    } else {
      toast.dismiss(toastId)
    }
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="card p-4 hover:border-ink-500/40 transition-all duration-200 group">
      <Link to={`/resources/${resource._id}`} className="block">
        <div className="flex items-start gap-3">
          {/* Icon / Uploader Avatar - Clickable for Quick View */}
          <div 
            className="w-10 h-10 rounded-xl bg-ink-500/15 flex items-center justify-center shrink-0 z-10 relative overflow-hidden"
          >
            {resource.uploadedBy?.avatar ? (
              <img 
                src={resource.uploadedBy.avatar} 
                alt={resource.uploadedBy.name || 'Uploader'} 
                className="w-full h-full object-cover" 
              />
            ) : resource.uploadedBy?.name ? (
              <span className="text-sm font-semibold text-ink-300 select-none uppercase">
                {resource.uploadedBy.name[0]}
              </span>
            ) : (
              <FileIcon type={resource.fileType} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h3 className="text-sm font-semibold text-text-main truncate group-hover:text-ink-300 transition-colors">
                {resource.title}
              </h3>
              <div className="flex gap-1.5 shrink-0">
                {!resource.isApproved && (
                  <span className="badge bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px]">Pending</span>
                )}
                <FileTypeBadge type={resource.fileType} />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap mb-2">
              <CategoryBadge category={resource.category} />
              <span className="text-xs text-text-muted">{resource.subject}</span>
              <span className="text-xs text-text-muted/60">Sem {resource.semester}</span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-3 pt-2.5 mt-2.5 border-t border-border/20">
              <div className="flex items-center gap-2.5 text-[11px] xs:text-xs text-text-muted shrink-0">
                <div className="flex items-center gap-1 font-medium">
                  <User size={11} className="shrink-0" />
                  <span className="max-w-[70px] xs:max-w-[100px] truncate" title={resource.uploadedBy?.name || 'Unknown'}>
                    {resource.uploadedBy?.name || 'Unknown'}
                  </span>
                </div>
                <span className="w-1 h-1 rounded-full bg-text-muted/30 shrink-0" />
                <span className="flex items-center gap-1">
                  <Calendar size={11} className="shrink-0" />
                  {timeAgo(resource.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-[11px] xs:text-xs text-text-muted font-medium shrink-0">
                {resource.avgRating > 0 && (
                  <span className="flex items-center gap-0.5">
                    <Star size={11} className="text-ink-400 fill-ink-400 shrink-0" />
                    {resource.avgRating.toFixed(1)}
                  </span>
                )}
                <span className="flex items-center gap-0.5">
                  <Eye size={11} className="shrink-0" />
                  {localViews}
                </span>
                <span className="flex items-center gap-0.5">
                  <Download size={11} className="shrink-0" />
                  {localDownloads}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      <div className="mt-3">
        <button 
          onClick={handleDownloadClick}
          className="w-full py-3 md:py-2 rounded-xl bg-ink-500/10 hover:bg-ink-500/20 border border-ink-500/20 hover:border-ink-500/40
                     text-[13px] md:text-xs font-medium text-ink-300 flex items-center justify-center gap-1.5 transition-all duration-200">
          <Download size={15} className="md:w-[13px] md:h-[13px]" />
          Download
        </button>
      </div>

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
    other: { emoji: '📎', color: 'text-text-muted' },
  }
  const { emoji } = icons[type] || icons.other
  return <span className="text-lg leading-none">{emoji}</span>
}
