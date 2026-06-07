import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Download, Eye, Calendar, User, ArrowLeft,
  Star, Send, ExternalLink, Tag, ThumbsUp, ThumbsDown, Trash2
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import useAuthStore from '../store/authStore'
import { FileTypeBadge, CategoryBadge, Stars, timeAgo, formatSize, forceDownloadBlob } from '../components/shared/utils'
import SkeletonBase, { SkeletonTitle, SkeletonText, SkeletonImage, SkeletonAvatar, SkeletonButton } from '../components/shared/Skeleton'
import { censorText } from '../lib/profanity'

export default function ResourceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
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

  const handleDownloadClick = async (e) => {
    e?.preventDefault()
    if (!user) return toast.error('You must be logged in to download files.')
    
    const toastId = toast.loading('Preparing download...')
    const success = await forceDownloadBlob(resource.fileUrl, resource.title, resource.fileType)
    if (success) {
      api.post(`/resources/${id}/download`).catch(() => {})
      setResource(r => ({ ...r, downloads: r.downloads + 1 }))
      useAuthStore.getState().refreshUser() // Update global stats in sidebar
      toast.success('Download complete!', { id: toastId })
    } else {
      toast.dismiss(toastId)
    }
  }

  const handleInteract = async (action) => {
    if (!user) return toast.error('Login required to interact')
    
    // Determine toggle logic
    let targetAction = action;
    if (action === 'like' && resource.likes?.includes(user._id)) targetAction = 'none';
    if (action === 'dislike' && resource.dislikes?.includes(user._id)) targetAction = 'none';

    try {
      const { data } = await api.post(`/resources/${id}/interact`, { action: targetAction })
      setResource(r => ({ ...r, likes: data.likes, dislikes: data.dislikes }))
    } catch (err) {
      toast.error('Failed to update interaction')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you securely authorizing the permanent deletion of this academic material? This action cannot be officially undone.')) return;
    try {
      await api.delete(`/resources/${id}`)
      toast.success('Resource successfully deleted and removed from system.')
      navigate('/browse')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete resource')
    }
  }

  const handleSubmitComment = async e => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const { data } = await api.post(`/resources/${id}/comments`, { rating: newRating, comment: censorText(newComment) })
      setComments(c => [data.comment, ...c])
      setNewComment('')
      toast.success('Review submitted!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review')
    } finally { setSubmitting(false) }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await api.delete(`/resources/${id}/comments/${commentId}`)
      setComments(c => c.filter(comment => comment._id !== commentId))
      toast.success('Comment deleted successfully')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete comment')
    }
  }

  if (loading) return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <SkeletonBase className="w-24 h-4 rounded-lg opacity-40" />
      </div>
      <div className="card p-4 lg:p-6 space-y-6">
        <div className="space-y-3">
          <div className="flex gap-2">
            <SkeletonBase className="h-6 w-16 rounded-full opacity-60" />
            <SkeletonBase className="h-6 w-20 rounded-full opacity-60" />
          </div>
          <SkeletonTitle width="70%" className="h-9" />
          <SkeletonText lines={2} className="opacity-40" />
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-3 rounded-xl bg-panel/30 border border-border">
              <SkeletonBase className="h-3 w-12 mb-2 opacity-30" />
              <SkeletonBase className="h-4 w-16 opacity-60" />
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SkeletonAvatar size={32} />
            <div className="space-y-1.5">
              <SkeletonBase className="h-3.5 w-24 opacity-60" />
              <SkeletonBase className="h-2.5 w-16 opacity-30" />
            </div>
          </div>
          <div className="flex gap-3">
            <SkeletonBase className="h-4 w-8 opacity-30" />
            <SkeletonBase className="h-4 w-8 opacity-30" />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <SkeletonButton className="flex-1 h-12" />
          <SkeletonButton className="w-12 h-12" />
          <SkeletonButton className="w-12 h-12" />
        </div>
      </div>
    </div>
  )

  if (!resource) return (
    <div className="p-6 text-center">
      <p className="text-text-muted">Resource not found</p>
      <Link to="/browse" className="text-ink-400 text-sm mt-2 inline-block">← Back to Browse</Link>
    </div>
  )

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-4 lg:space-y-5">
      <Link to="/browse" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-main transition-colors mb-1 lg:mb-0">
        <ArrowLeft size={14} /> Back to Browse
      </Link>

      {/* Main card */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} className="card p-4 lg:p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <FileTypeBadge type={resource.fileType} />
              <CategoryBadge category={resource.category} />
            </div>
            <h1 className="font-display font-bold text-xl text-text-main mb-1">{censorText(resource.title)}</h1>
            {resource.description && (
              <p className="text-text-muted text-sm">{censorText(resource.description)}</p>
            )}
          </div>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Subject',  value: censorText(resource.subject) },
            { label: 'Course',   value: censorText(resource.course) },
            { label: 'Semester', value: `Sem ${resource.semester}` },
            { label: 'Size',     value: formatSize(resource.fileSize) },
          ].map(({ label, value }) => (
            <div key={label} className="p-3 rounded-xl bg-panel/30 border border-border">
              <p className="text-xs text-text-muted mb-0.5">{label}</p>
              <p className="text-sm font-medium text-text-main">{value}</p>
            </div>
          ))}
        </div>

        {/* Tags */}
        {resource.tags?.length > 0 && (
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            <Tag size={12} className="text-text-muted" />
            {resource.tags.map(t => (
              <span key={t} className="badge bg-panel border border-border text-text-muted">{censorText(t)}</span>
            ))}
          </div>
        )}

        {/* Uploader + stats */}
        <div className="flex flex-wrap items-center justify-between gap-3.5 pt-4 border-t border-border">
          <Link to={`/profile/${resource.uploadedBy?._id}`} className="flex items-center gap-2 group min-w-0">
            <div className="w-8 h-8 rounded-full bg-panel flex items-center justify-center overflow-hidden ring-1 ring-border group-hover:ring-ink-500 transition-all shrink-0">
              {resource.uploadedBy?.avatar
                ? <img src={resource.uploadedBy.avatar} className="w-full h-full object-cover" alt="" />
                : <span className="text-xs font-bold text-ink-200">{resource.uploadedBy?.name?.[0]}</span>
              }
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-main group-hover:text-ink-400 transition-colors truncate max-w-[150px] xs:max-w-xs">{censorText(resource.uploadedBy?.name || '')}</p>
              <p className="text-xs text-text-muted">{timeAgo(resource.createdAt)}</p>
            </div>
          </Link>
          <div className="flex flex-wrap items-center gap-3.5 text-xs text-text-muted font-medium">
            <span className="flex items-center gap-1"><Eye size={12} className="shrink-0" />{resource.views}</span>
            <span className="flex items-center gap-1"><Download size={12} className="shrink-0" />{resource.downloads}</span>
            {resource.avgRating > 0 && (
              <span className="flex items-center gap-1">
                <Star size={12} className="text-ink-400 fill-ink-400 shrink-0" />
                {resource.avgRating.toFixed(1)} ({resource.ratingCount})
              </span>
            )}
          </div>
        </div>

        {/* Upload Stats Addon for Liking */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
          <button onClick={() => handleInteract('like')} className={`btn ${resource.likes?.includes(user?._id) ? 'bg-ink-500/20 text-ink-300 border border-ink-500/30' : 'bg-panel text-text-muted border border-border hover:bg-panel/80'} px-4 py-2 rounded-xl flex items-center gap-2 transition-all`}>
            <ThumbsUp size={16} className={resource.likes?.includes(user?._id) ? "fill-ink-500" : ""} />
            <span className="font-semibold text-sm">{resource.likes?.length || 0}</span>
          </button>
          <button onClick={() => handleInteract('dislike')} className={`btn ${resource.dislikes?.includes(user?._id) ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-panel text-text-muted border border-border hover:bg-panel/80'} px-4 py-2 rounded-xl flex items-center gap-2 transition-all`}>
            <ThumbsDown size={16} className={resource.dislikes?.includes(user?._id) ? "fill-red-500" : ""} />
            <span className="font-semibold text-sm">{resource.dislikes?.length || 0}</span>
          </button>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mt-5">
          <button 
            onClick={handleDownloadClick}
            className="btn-primary flex-1 justify-center py-3 flex items-center gap-2">
            <Download size={16} /> Download
          </button>
          
          {(user?.role === 'teacher' || user?.role === 'admin' || user?._id === resource.uploadedBy?._id) && (
            <button onClick={handleDelete} title="Moderation Delete"
              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 hover:border-red-500/30 transition-all rounded-xl px-4 py-3 flex items-center justify-center">
              <Trash2 size={16} />
            </button>
          )}



        </div>
      </motion.div>


      {/* Comments */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }} className="card p-4 lg:p-6">
        <h2 className="font-semibold text-text-main mb-4">Reviews ({comments.length})</h2>

        {/* Add review */}
        <form onSubmit={handleSubmitComment} className="mb-6 pb-6 border-b border-border">
          <p className="text-xs text-text-muted mb-2">Your rating</p>
          <div className="flex gap-1 mb-3">
            {[1,2,3,4,5].map(i => (
              <button key={i} type="button" onClick={() => setNewRating(i)}>
                <svg width={22} height={22} viewBox="0 0 24 24"
                  fill={i <= newRating ? 'var(--ink-primary)' : 'transparent'}
                  stroke={i <= newRating ? 'var(--ink-primary)' : 'var(--border)'}
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
          ? <p className="text-text-muted/40 text-sm text-center py-4">No reviews yet. Be the first!</p>
          : <div className="space-y-4">
              {comments.map(c => {
                const canDelete = user && (
                  user._id === c.user?._id ||
                  user.role === 'admin' ||
                  user.role === 'super_admin' ||
                  user.role === 'teacher'
                );

                return (
                <div key={c._id} className="flex gap-3 group relative pr-6">
                  <div className="w-8 h-8 rounded-full bg-ink-700 flex items-center justify-center shrink-0 overflow-hidden">
                    {c.user?.avatar
                      ? <img src={c.user.avatar} className="w-full h-full object-cover" alt="" />
                      : <span className="text-xs font-bold text-ink-200">{c.user?.name?.[0]}</span>
                    }
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-text-main">{censorText(c.user?.name || '')}</span>
                      <Stars rating={c.rating} size={11} />
                      <span className="text-xs text-text-muted/40">{timeAgo(c.createdAt)}</span>
                    </div>
                    {c.comment && <p className="text-sm text-text-muted">{censorText(c.comment)}</p>}
                  </div>
                  {canDelete && (
                    <button 
                      onClick={() => handleDeleteComment(c._id)}
                      className="absolute top-2 right-2 text-text-muted/50 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded-md transition-all"
                      title="Delete Comment"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              )})}
            </div>
        }
      </motion.div>
    </div>
  )
}
