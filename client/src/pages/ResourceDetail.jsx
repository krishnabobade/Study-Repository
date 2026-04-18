import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Download, Eye, Calendar, User, ArrowLeft,
  Star, Send, ExternalLink, Tag
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import useAuthStore from '../store/authStore'
import { FileTypeBadge, CategoryBadge, Stars, timeAgo, formatSize } from '../components/shared/utils'
import { Skeleton } from '../components/shared/utils'

export default function ResourceDetail() {
  const { id } = useParams()
  const { user } = useAuthStore()
  const [resource, setResource] = useState(null)
  const [comments, setComments] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [newRating,  setNewRating]  = useState(5)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get(`/resources/${id}`),
      api.get(`/resources/${id}/comments`),
    ]).then(([r, c]) => {
      setResource(r.data.resource)
      setComments(c.data.comments)
    }).catch(() => toast.error('Failed to load resource'))
      .finally(() => setLoading(false))
  }, [id])

  const handleDownload = async () => {
    try {
      const { data } = await api.post(`/resources/${id}/download`)
      window.open(data.fileUrl, '_blank')
      setResource(r => ({ ...r, downloads: r.downloads + 1 }))
    } catch { toast.error('Download failed') }
  }

  const handleSubmitComment = async e => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const { data } = await api.post(`/resources/${id}/comments`, { rating: newRating, comment: newComment })
      setComments(c => [data.comment, ...c])
      setNewComment('')
      toast.success('Review submitted!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review')
    } finally { setSubmitting(false) }
  }

  if (loading) return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-48" />
      <Skeleton className="h-32" />
    </div>
  )

  if (!resource) return (
    <div className="p-6 text-center">
      <p className="text-white/50">Resource not found</p>
      <Link to="/browse" className="text-ink-400 text-sm mt-2 inline-block">← Back to Browse</Link>
    </div>
  )

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <Link to="/browse" className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors">
        <ArrowLeft size={14} /> Back to Browse
      </Link>

      {/* Main card */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} className="card p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <FileTypeBadge type={resource.fileType} />
              <CategoryBadge category={resource.category} />
            </div>
            <h1 className="font-display font-bold text-xl text-white mb-1">{resource.title}</h1>
            {resource.description && (
              <p className="text-white/50 text-sm">{resource.description}</p>
            )}
          </div>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Subject',  value: resource.subject },
            { label: 'Course',   value: resource.course },
            { label: 'Semester', value: `Sem ${resource.semester}` },
            { label: 'Size',     value: formatSize(resource.fileSize) },
          ].map(({ label, value }) => (
            <div key={label} className="p-3 rounded-xl bg-white/[0.03] border border-border">
              <p className="text-xs text-white/30 mb-0.5">{label}</p>
              <p className="text-sm font-medium text-white">{value}</p>
            </div>
          ))}
        </div>

        {/* Tags */}
        {resource.tags?.length > 0 && (
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            <Tag size={12} className="text-white/30" />
            {resource.tags.map(t => (
              <span key={t} className="badge bg-white/5 text-white/40">{t}</span>
            ))}
          </div>
        )}

        {/* Uploader + stats */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Link to={`/profile/${resource.uploadedBy?._id}`} className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-ink-700 flex items-center justify-center overflow-hidden ring-1 ring-white/10 group-hover:ring-ink-500 transition-all">
              {resource.uploadedBy?.avatar
                ? <img src={resource.uploadedBy.avatar} className="w-full h-full object-cover" alt="" />
                : <span className="text-xs font-bold text-ink-200">{resource.uploadedBy?.name?.[0]}</span>
              }
            </div>
            <div>
              <p className="text-sm font-medium text-white group-hover:text-ink-400 transition-colors">{resource.uploadedBy?.name}</p>
              <p className="text-xs text-white/40">{timeAgo(resource.createdAt)}</p>
            </div>
          </Link>
          <div className="flex items-center gap-4 text-xs text-white/40">
            <span className="flex items-center gap-1"><Eye size={12} />{resource.views}</span>
            <span className="flex items-center gap-1"><Download size={12} />{resource.downloads}</span>
            {resource.avgRating > 0 && (
              <span className="flex items-center gap-1">
                <Star size={12} className="text-ink-400" />
                {resource.avgRating.toFixed(1)} ({resource.ratingCount})
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-5">
          <button onClick={handleDownload}
            className="btn-primary flex-1 justify-center py-3">
            <Download size={16} /> Download
          </button>
          <a href={resource.fileUrl} target="_blank" rel="noreferrer"
            className="btn-ghost border border-border px-4 py-3">
            <ExternalLink size={15} />
          </a>
        </div>
      </motion.div>

      {/* Comments */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }} className="card p-6">
        <h2 className="font-semibold text-white mb-4">Reviews ({comments.length})</h2>

        {/* Add review */}
        <form onSubmit={handleSubmitComment} className="mb-6 pb-6 border-b border-border">
          <p className="text-xs text-white/40 mb-2">Your rating</p>
          <div className="flex gap-1 mb-3">
            {[1,2,3,4,5].map(i => (
              <button key={i} type="button" onClick={() => setNewRating(i)}>
                <svg width={22} height={22} viewBox="0 0 24 24"
                  fill={i <= newRating ? '#6558f5' : 'transparent'}
                  stroke={i <= newRating ? '#6558f5' : '#ffffff30'}
                  strokeWidth={2} className="transition-all duration-100 hover:scale-110">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                </svg>
              </button>
            ))}
          </div>
          <textarea className="input resize-none h-20 py-3 mb-3"
            placeholder="Write a review (optional)…"
            value={newComment} onChange={e => setNewComment(e.target.value)} />
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Send size={14} />}
            Submit Review
          </button>
        </form>

        {/* List */}
        {comments.length === 0
          ? <p className="text-white/30 text-sm text-center py-4">No reviews yet. Be the first!</p>
          : <div className="space-y-4">
              {comments.map(c => (
                <div key={c._id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-ink-700 flex items-center justify-center shrink-0 overflow-hidden">
                    {c.user?.avatar
                      ? <img src={c.user.avatar} className="w-full h-full object-cover" alt="" />
                      : <span className="text-xs font-bold text-ink-200">{c.user?.name?.[0]}</span>
                    }
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white">{c.user?.name}</span>
                      <Stars rating={c.rating} size={11} />
                      <span className="text-xs text-white/30">{timeAgo(c.createdAt)}</span>
                    </div>
                    {c.comment && <p className="text-sm text-white/60">{c.comment}</p>}
                  </div>
                </div>
              ))}
            </div>
        }
      </motion.div>
    </div>
  )
}
