import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Search, Trash2, CheckCircle, XCircle, ExternalLink, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { SkeletonTable } from '../../components/shared/Skeleton.jsx';
import { FileTypeBadge, CategoryBadge } from '../../components/shared/utils.jsx';

export default function ResourceManagement() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const { data } = await api.get('/admin/resources');
      setResources(data.resources);
    } catch (err) {
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await api.delete(`/admin/resources/${confirmDelete._id}`);
      setResources(resources.filter(r => r._id !== confirmDelete._id));
      toast.success('Resource removed');
      setConfirmDelete(null);
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const handleToggleApproval = async (resource) => {
    try {
      const newStatus = !resource.isApproved;
      await api.patch(`/resources/${resource._id}`, { isApproved: newStatus });
      setResources(resources.map(r => r._id === resource._id ? { ...r, isApproved: newStatus } : r));
      toast.success(newStatus ? 'Resource approved' : 'Approval revoked');
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const filteredResources = resources.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || 
                          (r.uploadedBy?.name || '').toLowerCase().includes(search.toLowerCase()) ||
                          (r.subject || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'pending' && !r.isApproved) || 
                          (statusFilter === 'approved' && r.isApproved);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
            <FileText className="text-ink-500" /> Resource Control
          </h1>
          <p className="text-sm text-text-muted mt-1">Review, approve, and manage all academic submissions.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted/50" />
            <input 
              type="text"
              placeholder="Search files, uploaders, subjects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10 pr-4 py-2 w-full text-sm"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select text-sm py-2 px-3 w-full sm:w-44"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="table-main">
          <thead>
            <tr className="table-head">
              <th className="table-head-th">Resource</th>
              <th className="table-head-th">Uploaded By</th>
              <th className="table-head-th">Academic Details</th>
              <th className="table-head-th">File Type / Cat</th>
              <th className="table-head-th">Status</th>
              <th className="table-head-th text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan="6" className="p-0">
                  <SkeletonTable rows={8} cols={6} className="border-none rounded-none bg-transparent" />
                </td>
              </tr>
            ) : filteredResources.length === 0 ? (
              <tr>
                <td colSpan="6" className="table-cell text-center text-text-muted">No resources found.</td>
              </tr>
            ) : filteredResources.map((r) => (
              <motion.tr 
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={r._id} 
                className="table-row"
              >
                {/* Resource Details */}
                <td className="table-cell">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-ink-500/10 flex items-center justify-center shrink-0 overflow-hidden">
                      {r.uploadedBy?.avatar ? (
                        <img 
                          src={r.uploadedBy.avatar} 
                          alt={r.uploadedBy.name || 'Uploader'} 
                          className="w-full h-full object-cover" 
                        />
                      ) : r.uploadedBy?.name ? (
                        <span className="text-xs font-semibold text-ink-300 select-none uppercase">
                          {r.uploadedBy.name[0]}
                        </span>
                      ) : (
                        <FileIcon type={r.fileType} />
                      )}
                    </div>
                      <div className="min-w-0 max-w-[120px] xs:max-w-[180px] sm:max-w-[220px] md:max-w-xs">
                        <Link to={`/resources/${r._id}`} className="text-sm font-semibold text-text-main hover:text-ink-400 transition-colors truncate block" title={r.title}>
                          {r.title}
                        </Link>
                        <div className="text-xs text-text-muted truncate" title={r.subject}>{r.subject}</div>
                      </div>
                  </div>
                </td>

                {/* Uploaded By */}
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-ink-500/10 flex items-center justify-center text-[10px] font-bold text-ink-400 shrink-0">
                      {r.uploadedBy?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                      <div className="min-w-0 max-w-[90px] xs:max-w-[120px] sm:max-w-[150px]">
                        <div className="text-xs font-medium text-text-main truncate" title={r.uploadedBy?.name || 'Unknown'}>{r.uploadedBy?.name || 'Unknown'}</div>
                        <div className="text-[10px] text-text-muted truncate uppercase tracking-tighter">{r.uploadedBy?.role || 'student'}</div>
                      </div>
                  </div>
                </td>

                {/* Academic Details */}
                <td className="table-cell">
                  <div className="text-xs text-text-main font-medium">{r.course || 'N/A'}</div>
                  <div className="text-[10px] text-text-muted font-mono mt-0.5">Semester {r.semester || 'N/A'}</div>
                </td>

                {/* Badges */}
                <td className="table-cell">
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <FileTypeBadge type={r.fileType} />
                    <CategoryBadge category={r.category} />
                  </div>
                </td>

                {/* Status Badge */}
                <td className="table-cell">
                  {r.isApproved ? (
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20">
                      Approved
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/20 animate-pulse">
                      Pending
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="table-cell text-right">
                  <div className="flex items-center justify-end gap-2">
                    {/* Toggle Approval Button */}
                    <button 
                      onClick={() => handleToggleApproval(r)}
                      title={r.isApproved ? "Revoke Approval" : "Approve Resource"}
                      className={`p-2 rounded-xl border transition-all ${
                        r.isApproved 
                          ? 'bg-orange-500/5 border-orange-500/20 text-orange-400 hover:bg-orange-500/10'
                          : 'bg-green-500/5 border-green-500/20 text-green-400 hover:bg-green-500/10'
                      }`}
                    >
                      {r.isApproved ? <XCircle size={16} /> : <CheckCircle size={16} />}
                    </button>

                    {/* Open Original */}
                    <a 
                      href={r.fileUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="p-2 bg-panel border border-border text-text-muted hover:text-ink-400 rounded-xl transition-all"
                      title="Review / Open Original"
                    >
                      <ExternalLink size={16} />
                    </a>

                    {/* Delete */}
                    <button 
                      onClick={() => setConfirmDelete(r)}
                      className="p-2 bg-red-500/5 border border-red-500/10 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                      title="Delete Resource"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {confirmDelete && (
          <div className="modal-backdrop">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="modal-container"
            >
              <div className="modal-glow-1" />
              <div className="modal-glow-2" />
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4">
                  <ShieldAlert className="text-red-500" size={24} />
                </div>
                <h3 className="text-lg font-bold text-text-main">Delete this resource?</h3>
                <p className="text-sm text-text-muted mt-2 mb-6">
                  You are about to permanently delete <strong>{confirmDelete.title}</strong>. This cannot be reversed.
                </p>
                <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3 w-full">
                  <button 
                    onClick={() => setConfirmDelete(null)}
                    className="btn-secondary w-full sm:flex-1 py-2.5 justify-center"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleDelete}
                    className="btn-primary bg-red-600 hover:bg-red-500 w-full sm:flex-1 py-2.5 justify-center text-white border-transparent"
                  >
                    Delete Resource
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FileIcon({ type }) {
  const icons = {
    pdf:   { emoji: '📄' },
    doc:   { emoji: '📝' },
    ppt:   { emoji: '📊' },
    image: { emoji: '🖼️' },
    video: { emoji: '🎬' },
    other: { emoji: '📎' },
  }
  const { emoji } = icons[type] || icons.other
  return <span className="text-[17px] leading-none">{emoji}</span>
}
