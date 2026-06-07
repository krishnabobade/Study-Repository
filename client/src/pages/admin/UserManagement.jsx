import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Filter, Trash2, Edit2, Shield, MoreVertical, X, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { SkeletonTable } from '../../components/shared/Skeleton.jsx';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState(null);


  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data.users);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await api.delete(`/admin/users/${confirmDelete._id}`);
      setUsers(users.filter(u => u._id !== confirmDelete._id));
      toast.success('User removed successfully');
      setConfirmDelete(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };



  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || 
                          u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
            <Users className="text-ink-500" /> User Management
          </h1>
          <p className="text-sm text-text-muted mt-1">Control access levels and manage platform participants.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted/50" />
            <input 
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10 pr-4 py-2 w-full text-sm"
            />
          </div>
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="select text-sm py-2 px-3 w-full sm:w-40"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="teacher">Faculty</option>
            <option value="college_admin">Admins</option>
            <option value="super_admin">Super Admins</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="table-main">
          <thead>
            <tr className="table-head">
              <th className="table-head-th">User</th>
              <th className="table-head-th">Role</th>
              <th className="table-head-th">Joined</th>
              <th className="table-head-th text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan="4" className="p-0">
                  <SkeletonTable rows={10} cols={4} className="border-none rounded-none bg-transparent" />
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="4" className="table-cell text-center text-text-muted">No users found.</td>
              </tr>
            ) : filteredUsers.map((u) => (
              <motion.tr 
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={u._id} 
                className="table-row"
              >
                <td className="table-cell">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-ink-500/10 flex items-center justify-center text-ink-400 font-bold text-sm">
                      {u.avatar ? <img src={u.avatar} className="w-full h-full rounded-full object-cover" /> : u.name[0]}
                    </div>
                    <div className="min-w-0 max-w-[120px] xs:max-w-[160px] sm:max-w-[200px] md:max-w-xs">
                      <div className="text-sm font-semibold text-text-main truncate" title={u.name}>{u.name}</div>
                      <div className="text-xs text-text-muted truncate" title={u.email}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="table-cell">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                    u.role === 'super_admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                    u.role === 'college_admin' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    u.role === 'teacher' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                    'bg-ink-500/10 text-ink-400 border-ink-500/20'
                  }`}>
                    {u.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="table-cell text-sm text-text-muted">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="table-cell text-right">
                  <div className="flex items-center justify-end gap-2">
                    {u.role !== 'super_admin' && (
                      <button 
                        onClick={() => setConfirmDelete(u)}
                        className="p-2 hover:bg-red-500/10 text-text-muted hover:text-red-400 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
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
                  <AlertTriangle className="text-red-500" size={24} />
                </div>
                <h3 className="text-lg font-bold text-text-main">Permanently remove user?</h3>
                <p className="text-sm text-text-muted mt-2 mb-6">
                  This action cannot be undone. All data associated with <strong>{confirmDelete.name}</strong> will be lost.
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
                    Delete User
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
