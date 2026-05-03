import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Search, Filter, Trash2, CheckCircle, XCircle, ExternalLink, Download, User, Calendar, ShieldAlert } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { SkeletonList } from '../../components/shared/Skeleton.jsx';

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
                          r.uploader?.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'pending' && !r.isApproved) || 
                          (statusFilter === 'approved' && r.isApproved);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
            <FileText className="text-ink-500" /> Resource Control
          </h1>
          <p className="text-sm text-text-muted mt-1">Review, approve, and manage all academic submissions.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted/50" />
            <input 
              type="text"
              placeholder="Search files or uploaders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-panel border border-border rounded-xl text-sm focus:ring-2 focus:ring-ink-500 outline-none transition-all w-64"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-panel border border-border rounded-xl px-3 py-2 text-sm text-text-main outline-none focus:ring-2 focus:ring-ink-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <SkeletonList items={6} />
        ) : filteredResources.length === 0 ? (
          <div className="bg-panel border border-border rounded-2xl p-12 text-center text-text-muted">
            No resources matching your criteria.
          </div>
        ) : filteredResources.map((r) => (
          <motion.div 
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={r._id} 
            className="bg-panel border border-border rounded-2xl p-4 hover:border-ink-500/30 transition-all group shadow-sm hover:shadow-md"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="w-12 h-12 bg-surface border border-border rounded-xl flex items-center justify-center shrink-0">
                  <FileText className="text-text-muted group-hover:text-ink-400 transition-colors" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-text-main truncate">{r.title}</h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                    <div className="flex items-center gap-1.5 text-xs text-text-muted">
                      <User size={12} /> {r.uploader?.name || 'Unknown'}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-text-muted">
                      <Calendar size={12} /> {new Date(r.createdAt).toLocaleDateString()}
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      r.isApproved ? 'bg-green-500/10 text-green-400' : 'bg-orange-500/10 text-orange-400'
                    }`}>
                      {r.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                <button 
                  onClick={() => handleToggleApproval(r)}
                  title={r.isApproved ? "Revoke Approval" : "Approve File"}
                  className={`p-2 rounded-xl border transition-all ${
                    r.isApproved 
                      ? 'bg-orange-500/5 border-orange-500/20 text-orange-400 hover:bg-orange-500/10' 
                      : 'bg-green-500/5 border-green-500/20 text-green-400 hover:bg-green-500/10'
                  }`}
                >
                  {r.isApproved ? <XCircle size={18} /> : <CheckCircle size={18} />}
                </button>
                <a 
                  href={r.fileUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-2 bg-panel border border-border text-text-muted hover:text-ink-400 rounded-xl transition-all"
                  title="Preview Original"
                >
                  <ExternalLink size={18} />
                </a>
                <button 
                  onClick={() => setConfirmDelete(r)}
                  className="p-2 bg-red-500/5 border border-red-500/10 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                  title="Delete Resource"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-panel border border-border rounded-3xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <ShieldAlert className="text-red-500" size={24} />
              </div>
              <h3 className="text-lg font-bold text-text-main text-center">Delete this resource?</h3>
              <p className="text-sm text-text-muted text-center mt-2 mb-6">
                You are about to permanently delete <strong>{confirmDelete.title}</strong>. This cannot be reversed.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2.5 bg-panel border border-border text-text-main rounded-xl font-semibold hover:bg-surface transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors"
                >
                  Delete Resource
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
