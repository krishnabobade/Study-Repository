import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../components/shared/SEO';
import useAuthStore from '../store/authStore';
import { Bug, Send, ChevronLeft, User, Mail, FileText, HelpCircle, Globe, Laptop } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { censorText } from '../lib/profanity';

export default function BugReport() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    category: 'Bug/Issue',
    description: '',
    browser: 'Chrome',
    device: 'Desktop',
  });

  // Keep fields synchronized with user state if loaded asynchronously
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  // Auto-detect browser and device from User-Agent
  useEffect(() => {
    const ua = navigator.userAgent;
    let detectedBrowser = 'Chrome';
    if (ua.indexOf('Chrome') > -1 && ua.indexOf('Safari') > -1 && ua.indexOf('Edg') === -1) {
      detectedBrowser = 'Chrome';
    } else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) {
      detectedBrowser = 'Safari';
    } else if (ua.indexOf('Firefox') > -1) {
      detectedBrowser = 'Firefox';
    } else if (ua.indexOf('Edg') > -1) {
      detectedBrowser = 'Edge';
    } else if (ua.indexOf('OPR') > -1 || ua.indexOf('Opera') > -1) {
      detectedBrowser = 'Other';
    }

    let detectedDevice = 'Desktop';
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) {
      if (/iPad/i.test(ua) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && ua.indexOf('Macintosh') > -1)) {
        detectedDevice = 'Tablet';
      } else {
        detectedDevice = 'Mobile';
      }
    }

    setFormData(prev => ({
      ...prev,
      browser: detectedBrowser,
      device: detectedDevice
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. Web3Forms Payload
    const web3Payload = {
      access_key: "11ad3b8a-7372-45c8-a74c-0615a5ac01d9",
      name: censorText(formData.name),
      email: formData.email,
      subject: `[Bug Report] ${censorText(formData.subject)}`,
      category: formData.category,
      message: censorText(formData.description),
      browser: formData.browser,
      device: formData.device,
      from_name: "Study Repository Bug Tracker",
    };

    // 2. Local Backend Submission string
    const localMessage = `[Bug Report]
Name: ${censorText(formData.name)}
Email: ${formData.email}
Subject: ${censorText(formData.subject)}
Category: ${formData.category}

Environment:
- Browser: ${formData.browser}
- Device: ${formData.device}

Description:
${censorText(formData.description)}`;

    try {
      // Send to Web3Forms
      const web3Response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(web3Payload)
      });

      const web3Result = await web3Response.json();

      if (!web3Result.success) {
        throw new Error(web3Result.message || "Web3Forms submission failed");
      }

      // Record in local database
      await api.post('/feedback', { message: localMessage });

      toast.success('Bug report submitted successfully! Thank you.');
      setFormData(prev => ({
        ...prev,
        subject: '',
        description: '',
      }));
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to submit bug report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        navigate(-1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto w-full space-y-6"
    >
      <SEO title="Report a Bug | Study Repository" />

      <button 
        onClick={() => navigate(-1)} 
        className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-text-main transition-colors group cursor-pointer"
        aria-label="Go back"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" /> Back
      </button>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Info & Guideline Card */}
        <div className="w-full md:w-1/3 space-y-6">
          <div className="card p-6 relative overflow-hidden bg-gradient-to-b from-panel to-panel/50">
            {/* Subtle glow */}
            <div className="absolute -top-12 -left-12 w-36 h-36 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center shrink-0">
                <Bug className="text-red-500" size={24} />
              </div>
              <div>
                <h1 className="font-display font-bold text-2xl text-text-main">Report a Bug</h1>
                <p className="text-text-muted text-xs mt-1 leading-relaxed">
                  Help us improve Study Repository. Describe the issue in detail, and our admin team will investigate.
                </p>
              </div>

              <div className="border-t border-border pt-4 space-y-3">
                <h3 className="text-sm font-semibold text-text-main">Reporting Guidelines</h3>
                <ul className="text-xs text-text-muted space-y-2.5">
                  <li className="flex gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span>Be descriptive and summarize the issue clearly.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span>Provide steps to reproduce the bug.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span>Confirm your browser and device details are correct.</span>
                  </li>
                </ul>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-[11px] text-text-muted">
                  Need urgent support? Contact us:
                </p>
                <a href="mailto:krishnabobade1313@gmail.com" className="text-xs text-ink-400 hover:text-ink-300 font-medium transition-colors mt-1 block">
                  krishnabobade1313@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form Card */}
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="card p-6 md:p-8 space-y-5 relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-ink-500/10 blur-[80px] rounded-full pointer-events-none" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 relative z-10">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your Name"
                    className="input pl-10"
                  />
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-ink-400 transition-colors" size={18} />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your.email@example.com"
                    className="input pl-10"
                  />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-ink-400 transition-colors" size={18} />
                </div>
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-1.5 relative z-10">
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">
                Subject
              </label>
              <div className="relative group">
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g., File upload fails on PDF files"
                  className="input pl-10"
                />
                <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-ink-400 transition-colors" size={18} />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1.5 relative z-10">
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">
                Category
              </label>
              <div className="relative group">
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="select pl-10"
                >
                  <option value="Bug/Issue">Bug / Issue</option>
                  <option value="UI/UX Feedback">UI / UX Feedback</option>
                  <option value="Feature Suggestion">Feature Suggestion</option>
                  <option value="Performance">Performance</option>
                  <option value="Security">Security</option>
                  <option value="Other">Other</option>
                </select>
                <HelpCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-ink-400 transition-colors" size={18} />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5 relative z-10">
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">
                Issue Description
              </label>
              <div className="relative group">
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide a detailed description of the bug and steps to reproduce..."
                  className="input pl-10 resize-none h-32 py-3"
                ></textarea>
                <Bug className="absolute left-3.5 top-4 text-text-muted group-focus-within:text-ink-400 transition-colors" size={18} />
              </div>
            </div>

            {/* Browser & Device */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 relative z-10">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Browser
                </label>
                <div className="relative group">
                  <select
                    value={formData.browser}
                    onChange={e => setFormData({ ...formData, browser: e.target.value })}
                    className="select pl-10"
                  >
                    <option value="Chrome">Chrome</option>
                    <option value="Safari">Safari</option>
                    <option value="Firefox">Firefox</option>
                    <option value="Edge">Edge</option>
                    <option value="Other">Other</option>
                  </select>
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-ink-400 transition-colors" size={18} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Device
                </label>
                <div className="relative group">
                  <select
                    value={formData.device}
                    onChange={e => setFormData({ ...formData, device: e.target.value })}
                    className="select pl-10"
                  >
                    <option value="Desktop">Desktop</option>
                    <option value="Mobile">Mobile</option>
                    <option value="Tablet">Tablet</option>
                  </select>
                  <Laptop className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-ink-400 transition-colors" size={18} />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-border/50 relative z-10">
              <button 
                type="button"
                onClick={() => navigate(-1)}
                className="btn-secondary flex-1 justify-center py-3 text-base cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary flex-1 justify-center py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={18} /> Submit Report
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}

