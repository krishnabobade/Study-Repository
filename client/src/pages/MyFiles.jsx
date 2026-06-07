import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trash2, Download, Eye, FolderOpen, ExternalLink, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { FileTypeBadge, CategoryBadge, timeAgo, forceDownloadBlob } from '../components/shared/utils'
import { SkeletonList, SkeletonResourceCard } from '../components/shared/Skeleton.jsx'

export default function MyFiles() {
  const [resources, setResources] = useState([])
  const [loading, setLoading]     = useState(true)
  const [deleting, setDeleting]   = useState(null)

  const fetchFiles = async () => {
    try {
      const { data } = await api.get('/users/me/uploads')
      setResources(data.resources)
    } catch { toast.error('Failed to load files') }
    finally  { setLoading(false) }
  }

  useEffect(() => { fetchFiles() }, [])

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    setDeleting(id)
    try {
      await api.delete(`/resources/${id}`)
      setResources(r => r.filter(x => x._id !== id))
      toast.success('Resource deleted')
    } catch { toast.error('Delete failed') }
    finally { setDeleting(null) }
  }



  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-text-main mb-1">My Files</h1>
        <p className="text-text-muted text-sm">Manage your uploaded resources</p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {[...Array(5)].map((_, i) => <SkeletonResourceCard key={i} />)}
        </div>
      ) : resources.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-12 flex flex-col items-center justify-center text-center border-dashed border-2 border-border/50 bg-gradient-to-b from-surface to-panel"
        >
          <div className="w-20 h-20 bg-ink-500/10 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <FolderOpen size={36} className="text-ink-500" />
          </div>
          <h3 className="text-xl font-bold text-text-main mb-2">No files uploaded yet</h3>
          <p className="text-text-muted max-w-sm mb-8">
            Your uploaded notes, assignments, and study materials will safely appear here. Start sharing with your peers!
          </p>
          <Link 
            to="/upload"
            className="px-6 py-3 bg-ink-500 hover:bg-ink-600 text-white rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-ink-500/25 hover:shadow-ink-500/40 hover:-translate-y-0.5"
          >
            <Upload size={18} /> Upload First File
          </Link>
        </motion.div>
      ) : (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-text-muted">{resources.length} resource{resources.length !== 1 ? 's' : ''} uploaded</span>
          </div>
          <div className="flex flex-col gap-4">
            {resources.map((r, i) => (
              <motion.div key={r._id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card px-4 lg:px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 lg:gap-4 hover:border-ink-500/30 group transition-all relative shadow-sm hover:shadow-md">

                {/* Header (Mobile) & Icon */}
                <div className="flex items-start gap-3 w-full sm:w-auto">
                  <div className="w-10 h-10 rounded-xl bg-ink-500/15 flex items-center justify-center shrink-0 overflow-hidden relative">
                    {r.uploadedBy?.avatar ? (
                      <img 
                        src={r.uploadedBy.avatar} 
                        alt={r.uploadedBy.name || 'Uploader'} 
                        className="w-full h-full object-cover" 
                      />
                    ) : r.uploadedBy?.name ? (
                      <span className="text-sm font-semibold text-ink-300 select-none uppercase">
                        {r.uploadedBy.name[0]}
                      </span>
                    ) : (
                      <span className="text-lg">
                        {r.fileType === 'pdf' ? '📄' : r.fileType === 'doc' ? '📝' : r.fileType === 'ppt' ? '📊' : r.fileType === 'image' ? '🖼️' : '📎'}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <p className="text-sm font-semibold text-text-main truncate max-w-full block">{r.title}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      <FileTypeBadge type={r.fileType} />
                      <CategoryBadge category={r.category} />
                      <span className={`badge text-[10px] py-0.5 px-1.5 ${r.isApproved ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400'}`}>
                        {r.isApproved ? 'Active' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-muted">
                      <span className="truncate max-w-[120px] sm:max-w-none">{r.subject}</span>
                      <span className="hidden sm:inline">·</span>
                      <span>{r.course} (Sem {r.semester})</span>
                      <span className="hidden sm:inline">·</span>
                      <span className="text-text-muted/60">{timeAgo(r.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Stats (Desktop Only) */}
                <div className="hidden sm:flex items-center justify-end gap-5 text-xs text-text-muted ml-auto">
                  <span className="flex items-center gap-1"><Download size={12} />{r.downloads}</span>
                  <span className="flex items-center gap-1"><Eye size={12} />{r.views}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 mt-2 sm:mt-0 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity w-full sm:w-auto border-t border-border sm:border-0 pt-3 sm:pt-0">
                  <div className="sm:hidden flex-1 flex gap-4 text-xs text-text-muted">
                    <span className="flex items-center gap-1"><Download size={12} />{r.downloads}</span>
                    <span className="flex items-center gap-1"><Eye size={12} />{r.views}</span>
                  </div>
                  
                  <a href={r.fileUrl} target="_blank" rel="noreferrer"
                    className="p-2 sm:p-2 rounded-lg bg-panel sm:bg-transparent border border-border sm:border-transparent hover:bg-panel text-text-muted hover:text-text-main transition-all"
                    title="Open External">
                    <ExternalLink size={14} />
                  </a>
                  <button onClick={async (e) => {
                      e.preventDefault();
                      const toastId = toast.loading('Preparing download...');
                      const success = await forceDownloadBlob(r.fileUrl, r.title, r.fileType);
                      if (success) {
                        api.post(`/resources/${r._id}/download`).catch(() => {});
                        toast.success('Download complete!', { id: toastId });
                      } else {
                        toast.dismiss(toastId);
                      }
                    }}
                    className="p-2 sm:p-2 flex items-center justify-center rounded-lg bg-ink-500/10 sm:bg-transparent border border-ink-500/20 sm:border-transparent hover:bg-ink-500/20 text-ink-400 transition-all">
                    <Download size={14} />
                  </button>
                  <button onClick={() => handleDelete(r._id, r.title)}
                    disabled={deleting === r._id}
                    className="p-2 sm:p-2 rounded-lg bg-red-500/10 sm:bg-transparent border border-red-500/20 sm:border-transparent hover:bg-red-500/20 text-red-400 transition-all">
                    {deleting === r._id
                      ? <span className="w-3.5 h-3.5 border border-red-400/40 border-t-red-400 rounded-full animate-spin block" />
                      : <Trash2 size={14} />}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
