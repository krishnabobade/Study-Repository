import React, { useState } from 'react';
import SEO from '../components/shared/SEO';
import { Bug, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function BugReport() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ title: '', browser: 'Chrome', device: 'Desktop' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const message = `[Bug Report] ${formData.title}\n\nEnvironment:\n- Browser: ${formData.browser}\n- Device: ${formData.device}`;
    
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
    <div className="p-6 lg:p-10 max-w-3xl mx-auto w-full">
      <SEO title="Report a Bug | Study Repository" />
      
      <div className="mb-8">
        <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-4">
          <Bug className="text-red-500" size={24} />
        </div>
        <h1 className="text-3xl font-bold mb-2 text-text-main">Report a Bug</h1>
        <p className="text-text-muted">
          Found something that's not working right? Let us know so we can fix it.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-panel border border-border rounded-2xl p-6 shadow-sm space-y-5">
        <div>
          <label className="block text-sm font-medium text-text-main mb-1">Issue Description</label>
          <textarea 
            required 
            rows={4}
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            placeholder="Please describe the issue you encountered..."
            className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-text-main focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none"
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Browser</label>
            <select 
              value={formData.browser}
              onChange={e => setFormData({...formData, browser: e.target.value})}
              className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-text-main focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            >
              <option value="Chrome">Chrome</option>
              <option value="Safari">Safari</option>
              <option value="Firefox">Firefox</option>
              <option value="Edge">Edge</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Device</label>
            <select 
              value={formData.device}
              onChange={e => setFormData({...formData, device: e.target.value})}
              className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-text-main focus:ring-2 focus:ring-primary-500 outline-none transition-all"
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
          className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
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
