import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, BookOpen } from 'lucide-react';
import SEO from '../components/shared/SEO';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
      <SEO title="Forgot Password | Study Repository" />
      
      <div className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center text-sm font-medium text-ink-500 hover:text-ink-700 dark:text-ink-400 dark:hover:text-ink-300 mb-6 transition-colors">
          <ArrowLeft size={16} className="mr-2" />
          Back to login
        </Link>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-panel border border-border rounded-3xl p-8 shadow-xl"
        >
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-ink-500 flex items-center justify-center">
              <BookOpen size={24} className="text-text-main" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-text-main mb-2">Forgot Password</h2>
          
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="text-green-500" size={32} />
              </div>
              <p className="text-text-muted mb-6">
                If an account exists for <span className="font-semibold text-text-main">{email}</span>, you will receive a password reset link shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="w-full py-3 bg-panel border border-border text-text-main rounded-xl font-medium hover:bg-surface transition-colors"
              >
                Try another email
              </button>
            </motion.div>
          ) : (
            <>
              <p className="text-center text-text-muted mb-6">
                Enter the email address associated with your account and we'll send you a link to reset your password.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-main mb-1.5">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={18} className="text-text-muted/60" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-3 text-text-main focus:ring-2 focus:ring-ink-500 focus:border-ink-500 outline-none transition-all"
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-ink-600 hover:bg-ink-700 text-white rounded-xl font-medium transition-colors disabled:opacity-70 flex justify-center items-center"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
