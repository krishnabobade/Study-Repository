import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, User, Activity, Search, ChevronDown, Terminal } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { SkeletonTable } from '../../components/shared/Skeleton.jsx';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data } = await api.get('/admin/audit-logs');
      setLogs(data.logs);
    } catch (err) {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(l => 
    l.action.toLowerCase().includes(search.toLowerCase()) || 
    l.details.toLowerCase().includes(search.toLowerCase()) ||
    (l.performedBy?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
            <Shield className="text-ink-500" /> Audit Trail
          </h1>
          <p className="text-sm text-text-muted mt-1">Immutable history of security and administrative actions.</p>
        </div>
        
        <div className="relative w-full sm:w-64">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted/50" />
          <input 
            type="text"
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10 pr-4 py-2 w-full text-sm"
          />
        </div>
      </div>

      <div className="table-container">
        <table className="table-main">
          <thead>
            <tr className="table-head">
              <th className="table-head-th w-1/4">Action</th>
              <th className="table-head-th w-1/4">Performed By</th>
              <th className="table-head-th w-1/4">Target / Detail</th>
              <th className="table-head-th w-1/4 text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan="4" className="p-0">
                  <SkeletonTable rows={10} cols={4} className="border-none rounded-none bg-transparent" />
                </td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="4" className="table-cell text-center text-text-muted">No logs found.</td>
              </tr>
            ) : filteredLogs.map((log) => (
              <tr key={log._id} className="table-row">
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${
                      log.action.includes('DELETE') ? 'bg-red-500/10 text-red-400' :
                      log.action.includes('UPDATE') ? 'bg-blue-500/10 text-blue-400' :
                      'bg-green-500/10 text-green-400'
                    }`}>
                      <Activity size={14} />
                    </div>
                    <span className="text-sm font-bold text-text-main font-mono">{log.action}</span>
                  </div>
                </td>
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-ink-700 flex items-center justify-center text-[10px] font-bold text-ink-200 shrink-0">
                      {log.performedBy?.name?.[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-text-main truncate">{log.performedBy?.name}</div>
                      <div className="text-[10px] text-text-muted uppercase tracking-tighter">{log.performedBy?.role}</div>
                    </div>
                  </div>
                </td>
                <td className="table-cell">
                  <p className="text-xs text-text-main/70 line-clamp-2 max-w-xs">{log.details}</p>
                  {log.targetName && <span className="text-[10px] text-ink-400 font-medium">Target: {log.targetName}</span>}
                </td>
                <td className="table-cell text-right">
                  <div className="flex flex-col items-end">
                    <div className="text-xs text-text-main font-medium">{new Date(log.createdAt).toLocaleDateString()}</div>
                    <div className="text-[10px] text-text-muted font-mono">{new Date(log.createdAt).toLocaleTimeString()}</div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 bg-ink-500/5 border border-ink-500/10 rounded-xl flex items-center gap-3">
        <Terminal size={16} className="text-ink-400" />
        <p className="text-xs text-text-muted">Showing the latest 200 security events. Audit logs are cryptographically indexed and cannot be modified or deleted.</p>
      </div>
    </div>
  );
}
