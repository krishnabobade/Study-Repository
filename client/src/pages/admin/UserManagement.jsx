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
  const [editingUser, setEditingUser] = useState(null);

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

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await api.patch(`/admin/users/${userId}`, { role: newRole });
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      toast.success('Role updated');
      setEditingUser(null);
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || 
                          u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
            <Users className="text-ink-500" /> User Management
          </h1>
          <p className="text-sm text-text-muted mt-1">Control access levels and manage platform participants.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted/50" />
            <input 
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-panel border border-border rounded-xl text-sm focus:ring-2 focus:ring-ink-500 outline-none transition-all w-64"
            />
          </div>
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-panel border border-border rounded-xl px-3 py-2 text-sm text-text-main outline-none focus:ring-2 focus:ring-ink-500"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="teacher">Faculty</option>
            <option value="college_admin">Admins</option>
            <option value="super_admin">Super Admins</option>
          </select>
        </div>
      </div>

      <div className="bg-panel border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface/50 border-b border-border">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">User</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Role</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Joined</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted text-right">Actions</th>
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
                  <td colSpan="4" className="px-6 py-12 text-center text-text-muted">No users found.</td>
                </tr>
              ) : filteredUsers.map((u) => (
                <motion.tr 
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={u._id} 
                  className="hover:bg-surface/30 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-ink-500/10 flex items-center justify-center text-ink-400 font-bold text-sm">
                        {u.avatar ? <img src={u.avatar} className="w-full h-full rounded-full object-cover" /> : u.name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-text-main">{u.name}</div>
                        <div className="text-xs text-text-muted">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                      u.role === 'super_admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                      u.role === 'college_admin' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      u.role === 'teacher' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                      'bg-ink-500/10 text-ink-400 border-ink-500/20'
                    }`}>
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-muted">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setEditingUser(u)}
                        className="p-2 hover:bg-ink-500/10 text-text-muted hover:text-ink-400 rounded-lg transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
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
      </div>

      {/* Confirmation Modal */}
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
                <AlertTriangle className="text-red-500" size={24} />
              </div>
              <h3 className="text-lg font-bold text-text-main text-center">Permanently remove user?</h3>
              <p className="text-sm text-text-muted text-center mt-2 mb-6">
                This action cannot be undone. All data associated with <strong>{confirmDelete.name}</strong> will be lost.
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
                  Delete User
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Role Modal */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-panel border border-border rounded-3xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-text-main">Change User Role</h3>
                <button onClick={() => setEditingUser(null)} className="text-text-muted hover:text-text-main">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-3">
                {['student', 'teacher', 'college_admin', 'super_admin'].map((role) => (
                  <button
                    key={role}
                    onClick={() => handleUpdateRole(editingUser._id, role)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all ${
                      editingUser.role === role 
                        ? 'border-ink-500 bg-ink-500/10 text-ink-400' 
                        : 'border-border bg-surface hover:bg-panel text-text-main'
                    }`}
                  >
                    <div className="font-bold capitalize">{role.replace('_', ' ')}</div>
                    <div className="text-xs opacity-60">
                      {role === 'super_admin' ? 'Full platform control and logging' : 
                       role === 'college_admin' ? 'Manage resources and standard users' :
                       role === 'teacher' ? 'Upload materials and manage own content' :
                       'Standard student access'}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
