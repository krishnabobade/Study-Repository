import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trash2, Download, Eye, FolderOpen, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { FileTypeBadge, CategoryBadge, timeAgo } from '../components/shared/utils'
import { Skeleton } from '../components/shared/utils'

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

  const handleDownload = async (id, fileUrl) => {
    try {
      await api.post(`/resources/${id}/download`)
      window.open(fileUrl, '_blank')
    } catch { toast.error('Download failed') }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-white mb-1">My Files</h1>
        <p className="text-white/50 text-sm">Manage your uploaded resources</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_,i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : resources.length === 0 ? (
        <div className="text-center py-24">
          <FolderOpen size={48} className="mx-auto text-white/10 mb-4" />
          <p className="text-white/50 font-medium">No uploads yet</p>
          <p className="text-white/30 text-sm mt-1">Start sharing resources with your peers</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <span className="text-sm font-medium text-white/60">{resources.length} resource{resources.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="divide-y divide-border">
            {resources.map((r, i) => (
              <motion.div key={r._id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="px-5 py-4 flex items-center gap-4 hover:bg-white/[0.02] group transition-colors">

                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-ink-500/15 flex items-center justify-center shrink-0 text-lg">
                  {r.fileType === 'pdf' ? '📄' : r.fileType === 'doc' ? '📝' : r.fileType === 'ppt' ? '📊' : r.fileType === 'image' ? '🖼️' : '📎'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-white truncate">{r.title}</p>
                    <FileTypeBadge type={r.fileType} />
                    <CategoryBadge category={r.category} />
                    <span className={`badge text-xs ${r.isApproved ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400'}`}>
                      {r.isApproved ? 'Active' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/40">
                    <span>{r.subject}</span>
                    <span>·</span>
                    <span>{r.course} — Sem {r.semester}</span>
                    <span>·</span>
                    <span>{timeAgo(r.createdAt)}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-5 text-xs text-white/40">
                  <span className="flex items-center gap-1"><Download size={12} />{r.downloads}</span>
                  <span className="flex items-center gap-1"><Eye size={12} />{r.views}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a href={r.fileUrl} target="_blank" rel="noreferrer"
                    className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                    <ExternalLink size={14} />
                  </a>
                  <button onClick={() => handleDownload(r._id, r.fileUrl)}
                    className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-ink-400 transition-colors">
                    <Download size={14} />
                  </button>
                  <button onClick={() => handleDelete(r._id, r.title)}
                    disabled={deleting === r._id}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors">
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
