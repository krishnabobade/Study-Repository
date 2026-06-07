import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/shared/SEO';
import { Bug, Send, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { censorText } from '../lib/profanity';

export default function BugReport() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ title: '', browser: 'Chrome', device: 'Desktop' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const message = `[Bug Report] ${censorText(formData.title)}\n\nEnvironment:\n- Browser: ${formData.browser}\n- Device: ${formData.device}`;
    
    try {
      await api.post('/feedback', { message });
      toast.success('Bug report submitted successfully. Thank you!');
      setFormData({ title: '', browser: 'Chrome', device: 'Desktop' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit bug report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-2xl mx-auto w-full">
      <SEO title="Report a Bug | Study Repository" />
      
      <button 
        onClick={() => navigate(-1)} 
        className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-text-main transition-colors mb-4 group cursor-pointer"
        aria-label="Go back"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" /> Back
      </button>
      
      <div className="mb-6 flex items-center gap-4">
        <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center shrink-0">
          <Bug className="text-red-500" size={24} />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl text-text-main">Report a Bug</h1>
          <p className="text-text-muted text-sm">Found something that's not working right? Let us know so we can fix it.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-text-main mb-1.5">Issue Description</label>
          <textarea 
            required 
            rows={4}
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            placeholder="Please describe the issue you encountered..."
            className="input resize-none h-28 py-3"
          ></textarea>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-text-main mb-1.5">Browser</label>
            <select 
              value={formData.browser}
              onChange={e => setFormData({...formData, browser: e.target.value})}
              className="select"
            >
              <option value="Chrome">Chrome</option>
              <option value="Safari">Safari</option>
              <option value="Firefox">Firefox</option>
              <option value="Edge">Edge</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main mb-1.5">Device</label>
            <select 
              value={formData.device}
              onChange={e => setFormData({...formData, device: e.target.value})}
              className="select"
            >
              <option value="Desktop">Desktop</option>
              <option value="Mobile">Mobile</option>
              <option value="Tablet">Tablet</option>
            </select>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="btn-primary w-full justify-center py-3 text-base mt-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Send size={18} /> Submit Report
            </>
          )}
        </button>
      </form>
    </div>
  );
}
