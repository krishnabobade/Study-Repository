import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trash2, Download, Eye, FolderOpen, ExternalLink, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { FileTypeBadge, CategoryBadge, timeAgo } from '../components/shared/utils'
import { SkeletonList } from '../components/shared/Skeleton.jsx'

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

  const [downloadingId, setDownloadingId] = useState(null);

  const handleDownload = async (id, resource) => {
    if (downloadingId) return;
    setDownloadingId(id);
    const toastId = toast.loading('Starting download...');
    try {
      const { data } = await api.post(`/resources/${id}/download`)
      const link = document.createElement('a');
      link.href = data.fileUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.download = resource.originalName || resource.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download ready', { id: toastId });
    } catch { 
      toast.error('Download failed', { id: toastId });
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-text-main mb-1">My Files</h1>
        <p className="text-text-muted text-sm">Manage your uploaded resources</p>
      </div>

      {loading ? (
        <SkeletonList items={5} />
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
          <button 
            onClick={() => window.location.href='/upload'}
            className="px-6 py-3 bg-ink-500 hover:bg-ink-600 text-white rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-ink-500/25 hover:shadow-ink-500/40 hover:-translate-y-0.5"
          >
            <Upload size={18} /> Upload First File
          </button>
        </motion.div>
      ) : (
        <div className="card overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <span className="text-sm font-medium text-text-muted">{resources.length} resource{resources.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="divide-y divide-border">
            {resources.map((r, i) => (
              <motion.div key={r._id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="px-5 py-4 flex items-center gap-4 hover:bg-white/[0.02] group transition-colors">

                {/* Icon */}
                <div 
                  className="w-10 h-10 rounded-xl bg-ink-500/15 flex items-center justify-center shrink-0 text-lg"
                >
                  {r.fileType === 'pdf' ? '📄' : r.fileType === 'doc' ? '📝' : r.fileType === 'ppt' ? '📊' : r.fileType === 'image' ? '🖼️' : '📎'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-text-main truncate">{r.title}</p>
                    <FileTypeBadge type={r.fileType} />
                    <CategoryBadge category={r.category} />
                    <span className={`badge text-xs ${r.isApproved ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400'}`}>
                      {r.isApproved ? 'Active' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-muted">
                    <span>{r.subject}</span>
                    <span>·</span>
                    <span>{r.course} — Sem {r.semester}</span>
                    <span>·</span>
                    <span>{timeAgo(r.createdAt)}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-5 text-xs text-text-muted">
                  <span className="flex items-center gap-1"><Download size={12} />{r.downloads}</span>
                  <span className="flex items-center gap-1"><Eye size={12} />{r.views}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">

                  <a href={r.fileUrl} target="_blank" rel="noreferrer"
                    className="p-2 rounded-lg hover:bg-panel text-text-muted hover:text-text-main transition-colors"
                    title="Open External">
                    <ExternalLink size={14} />
                  </a>
                  <button onClick={() => handleDownload(r._id, r)}
                    disabled={downloadingId === r._id}
                    className={`p-2 rounded-lg transition-colors ${downloadingId === r._id ? 'text-ink-400 opacity-50 cursor-not-allowed' : 'hover:bg-panel text-text-muted hover:text-ink-400'}`}>
                    {downloadingId === r._id ? <span className="w-3.5 h-3.5 border-2 border-ink-400/30 border-t-ink-400 rounded-full animate-spin block" /> : <Download size={14} />}
                  </button>
                  <button onClick={() => handleDelete(r._id, r.title)}
                    disabled={deleting === r._id}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-colors">
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
