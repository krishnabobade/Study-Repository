import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, BookOpen, KeyRound, ShieldCheck, CheckCircle2, RefreshCw, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import SEO from '../components/shared/SEO';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState('email'); // 'email' | 'otp' | 'reset' | 'success'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resetToken, setResetToken] = useState('');
  
  // Password Reset State
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Cooldown timer & loading
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef([]);

  // Cooldown effect
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Handle Email Submission (Step 1)
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email address');

    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      toast.success(res.data.message || 'OTP sent successfully!');
      setStep('otp');
      setCooldown(60); // 60 seconds cooldown
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // OTP Input Handlers (Step 2)
  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    if (pastedData.some(isNaN)) return;

    const newOtp = [...otp];
    pastedData.forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);
    inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
  };

  // Handle OTP Verification
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length < 6) return toast.error('Please enter the complete 6-digit OTP.');

    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { email, otp: otpString });
      toast.success(res.data.message || 'OTP verified successfully!');
      setResetToken(res.data.resetToken);
      setStep('reset');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setLoading(true);
    try {
      const res = await api.post('/auth/resend-otp', { email });
      toast.success(res.data.message || 'A new OTP has been sent.');
      setCooldown(60);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Reset (Step 3)
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match.');
    }
    if (password.length < 8) {
      return toast.error('Password must be at least 8 characters long.');
    }

    setLoading(true);
    try {
      const res = await api.post(`/auth/reset-password/${resetToken}`, { password, email });
      toast.success(res.data.message || 'Password reset successfully!');
      setStep('success');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  // Password Strength Checker Helper
  const getPasswordStrength = (pass) => {
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score; // 0 to 4
  };

  const strengthScore = getPasswordStrength(password);
  const strengthLabels = ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500', 'bg-emerald-600'];

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
      <SEO title="Secure Password Recovery | Study Repository" />
      
      <div className="w-full max-w-md">
        {step !== 'success' && (
          <button
            onClick={() => {
              if (step === 'otp') setStep('email');
              else if (step === 'reset') setStep('otp');
              else navigate('/login');
            }}
            className="inline-flex items-center text-sm font-medium text-ink-500 hover:text-ink-700 dark:text-ink-400 dark:hover:text-ink-300 mb-6 transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            {step === 'email' ? 'Back to login' : 'Back'}
          </button>
        )}
        
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="bg-panel border border-border rounded-3xl p-5 xs:p-8 shadow-xl relative overflow-hidden"
          >
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-ink-500/10 flex items-center justify-center border border-ink-500/20 shadow-inner">
                {step === 'email' && <Mail size={28} className="text-ink-600 dark:text-ink-400" />}
                {step === 'otp' && <ShieldCheck size={28} className="text-ink-600 dark:text-ink-400" />}
                {step === 'reset' && <KeyRound size={28} className="text-ink-600 dark:text-ink-400" />}
                {step === 'success' && <CheckCircle2 size={28} className="text-emerald-500 animate-bounce" />}
              </div>
            </div>
            
            {/* STEP 1: EMAIL REQUEST */}
            {step === 'email' && (
              <>
                <h2 className="text-2xl font-bold text-center text-text-main mb-2">Forgot Password?</h2>
                <p className="text-center text-text-muted mb-6 text-sm">
                  Enter your registered institutional email address. We'll send a secure One-Time Password (OTP) to confirm your identity.
                </p>
                
                <form onSubmit={handleEmailSubmit} className="space-y-4">
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
                        placeholder="you@mitwpu.edu.in"
                        className="input pl-10"
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full justify-center py-3.5"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Send Security OTP</>
                    )}
                  </button>
                </form>
              </>
            )}

            {/* STEP 2: OTP VERIFICATION */}
            {step === 'otp' && (
              <>
                <h2 className="text-2xl font-bold text-center text-text-main mb-2">Verify Your Email</h2>
                <p className="text-center text-text-muted mb-6 text-sm">
                  We've sent a 6-digit verification code to <span className="font-semibold text-text-main">{email}</span>.
                </p>
                
                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  <div className="flex justify-center gap-1.5 xs:gap-2 my-4" onPaste={handleOtpPaste}>
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-9 h-11 xs:w-11 xs:h-13 sm:w-12 sm:h-14 text-center text-lg xs:text-xl font-bold bg-surface border border-border rounded-lg xs:rounded-xl text-text-main focus:ring-2 focus:ring-ink-500 focus:border-ink-500 outline-none transition-all shadow-sm"
                      />
                    ))}
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full justify-center py-3.5"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Verify & Proceed</>
                    )}
                  </button>

                  <div className="flex flex-col items-center justify-center gap-2 pt-2 border-t border-border">
                    <p className="text-xs text-text-muted">Didn't receive the email?</p>
                    <button
                      type="button"
                      disabled={cooldown > 0 || loading}
                      onClick={handleResendOtp}
                      className="inline-flex items-center text-sm font-semibold text-ink-600 hover:text-ink-700 dark:text-ink-400 dark:hover:text-ink-300 disabled:text-text-muted disabled:cursor-not-allowed transition-colors gap-1.5"
                    >
                      <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                      {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* STEP 3: RESET PASSWORD */}
            {step === 'reset' && (
              <>
                <h2 className="text-2xl font-bold text-center text-text-main mb-2">Create New Password</h2>
                <p className="text-center text-text-muted mb-6 text-sm">
                  Your identity has been verified. Choose a strong new password for your account.
                </p>
                
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-main mb-1.5">New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock size={18} className="text-text-muted/60" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="input pl-10 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-main transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {/* Password Strength Meter */}
                    {password && (
                      <div className="mt-2 space-y-1.5 animate-fadeIn">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-text-muted">Security Strength:</span>
                          <span className="font-semibold text-text-main">{strengthLabels[strengthScore]}</span>
                        </div>
                        <div className="flex gap-1 h-1.5 w-full bg-surface rounded-full overflow-hidden p-0.5 border border-border">
                          {[0, 1, 2, 3].map((index) => (
                            <div
                              key={index}
                              className={`h-full flex-1 rounded-full transition-all duration-300 ${
                                index <= strengthScore - 1 ? strengthColors[strengthScore] : 'bg-transparent'
                              }`}
                            />
                          ))}
                        </div>
                        <ul className="text-[11px] text-text-muted space-y-0.5 pt-1">
                          <li className={`flex items-center gap-1.5 ${password.length >= 8 ? 'text-emerald-500' : ''}`}>
                            <div className={`w-1 h-1 rounded-full ${password.length >= 8 ? 'bg-emerald-500' : 'bg-text-muted'}`} />
                            At least 8 characters
                          </li>
                          <li className={`flex items-center gap-1.5 ${/[A-Z]/.test(password) && /[0-9]/.test(password) ? 'text-emerald-500' : ''}`}>
                            <div className={`w-1 h-1 rounded-full ${/[A-Z]/.test(password) && /[0-9]/.test(password) ? 'bg-emerald-500' : 'bg-text-muted'}`} />
                            Contains uppercase letter & number
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-main mb-1.5">Confirm New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock size={18} className="text-text-muted/60" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="input pl-10 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-main transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading || password.length < 8 || password !== confirmPassword}
                    className="btn-primary w-full justify-center py-3.5 mt-4"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Reset Password</>
                    )}
                  </button>
                </form>
              </>
            )}

            {/* STEP 4: SUCCESS */}
            {step === 'success' && (
              <div className="text-center py-4">
                <h2 className="text-2xl font-bold text-text-main mb-2">Password Updated!</h2>
                <p className="text-text-muted mb-6 text-sm">
                  Your password has been successfully reset. You can now use your new credentials to access your account.
                </p>
                <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-xs text-text-muted">Redirecting to login page...</p>
                <Link
                  to="/login"
                  className="btn-primary w-full justify-center py-3.5 mt-6"
                >
                  Go to Login Now
                </Link>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
