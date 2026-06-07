import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, Upload, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

import { SkeletonList, SkeletonTitle, SkeletonText } from '../components/shared/Skeleton';

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const fileInputRef = useRef(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const { data } = await api.get('/assignments');
      setAssignments(data.assignments);
    } catch (err) {
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedAssignment) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File too large (max 50 MB)');
      return;
    }

    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);

    try {
      await api.post(`/assignments/${selectedAssignment}/submit`, fd);
      toast.success('Assignment submitted successfully');
      fetchAssignments();
    } catch (err) {
      toast.error('Failed to submit assignment');
    } finally {
      setUploading(false);
      setSelectedAssignment(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <SkeletonTitle width="120px" className="h-10" />
        </div>
        <SkeletonList items={5} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
          <FileText size={20} className="text-cyan-400" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl text-text-main">My Assignments</h1>
          <p className="text-sm text-text-muted mt-1">View and submit assignments for your course.</p>
        </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileSelect} 
      />

      <div className="space-y-4">
        {assignments.length === 0 ? (
          <div className="card p-12 text-center flex flex-col items-center border-dashed">
            <FileText size={32} className="text-text-muted/30 mb-4" />
            <p className="text-text-muted">No assignments available at the moment.</p>
          </div>
        ) : (
          assignments.map((assignment, i) => {
            const isOverdue = new Date() > new Date(assignment.dueDate);
            
            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={assignment._id} 
                className="card p-5 border border-border bg-panel"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1 w-full min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="text-lg font-bold text-text-main">{assignment.title}</h3>
                      {isOverdue && (
                        <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 text-[10px] uppercase font-bold">
                          Overdue
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-text-muted mb-4">{assignment.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <Clock size={14} className={isOverdue ? 'text-red-400' : 'text-ink-400'} />
                        Due: {new Date(assignment.dueDate).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText size={14} />
                        {assignment.subject}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center items-stretch w-full md:w-auto shrink-0">
                    <button 
                      onClick={() => {
                        setSelectedAssignment(assignment._id);
                        fileInputRef.current?.click();
                      }}
                      disabled={uploading}
                      className="px-4 py-2.5 min-h-[44px] bg-ink-500 hover:bg-ink-600 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 w-full"
                    >
                      <Upload size={16} /> Submit Assignment
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
