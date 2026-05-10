import React, { useState, useMemo } from 'react';
import SEO from '../components/shared/SEO';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, FileText, MessageCircle, Mail, 
  GraduationCap, Users, Shield, 
  Search, Eye, Download, Bookmark, 
  Upload, Settings, CheckSquare, 
  UserCog, CheckCircle2, Activity,
  ChevronDown, SearchX
} from 'lucide-react';

const faqsData = [
  // Students
  { category: '📚 For Students', question: 'How do I search for notes or resources?', answer: 'You can use the global search bar at the top of your dashboard, or navigate to the Browse section to filter by course and semester.' },
  { category: '📚 For Students', question: 'How do I download study materials?', answer: 'On any resource page, click the "Download" button. The file will securely download to your local device.' },
  { category: '📚 For Students', question: 'How do I save/bookmark resources?', answer: 'Click the bookmark icon on any resource. You can find all your saved materials in the "Saved" section of your dashboard.' },
  { category: '📚 For Students', question: 'What should I do if a file is not opening?', answer: 'Ensure you have a PDF reader or compatible software installed. If the issue persists, report the bug using the "Report Bug" page.' },
  
  // Faculty
  { category: '👨‍🏫 For Faculty', question: 'How do I upload notes or assignments?', answer: 'Go to the "Upload" section in your sidebar, select your file, fill in the academic details, and click submit.' },
  { category: '👨‍🏫 For Faculty', question: 'What file formats are supported?', answer: 'We currently support PDF, DOCX, PPTX, and common image formats (JPG, PNG). The maximum file size is typically 10MB.' },
  { category: '👨‍🏫 For Faculty', question: 'How do I edit or delete uploaded files?', answer: 'Navigate to "My Files" in your dashboard. Click the three-dot menu next to any of your uploads to edit details or delete the file.' },
  { category: '👨‍🏫 For Faculty', question: 'Why is my upload pending approval?', answer: 'To maintain quality, some uploads go through a brief review process by an administrator before becoming visible to all students.' },
  { category: '👨‍🏫 For Faculty', question: 'How do I manage my uploaded resources?', answer: 'Your "My Files" dashboard provides a complete overview of all your uploads, including their views, downloads, and approval status.' },
  
  // Admin
  { category: '🛠️ For Admin', question: 'How do I approve or reject uploads?', answer: 'Access the "Pending Approvals" dashboard. Review the document content and academic details, then click Approve or Reject.' },
  { category: '🛠️ For Admin', question: 'How do I manage users?', answer: 'Navigate to the "User Management" section to view all registered users, change roles, or suspend accounts if necessary.' },
  { category: '🛠️ For Admin', question: 'How do I view reports and analytics?', answer: 'The main admin dashboard provides real-time statistics on total users, daily uploads, storage usage, and engagement metrics.' },
  { category: '🛠️ For Admin', question: 'How do I handle reported issues?', answer: 'Go to the "User Feedback" or "Bug Reports" section to review tickets submitted by users and take appropriate action.' },
  
  // Account
  { category: '🔐 Account & Security', question: 'How do I reset my password?', answer: 'Click "Forgot Password" on the login screen. Enter your registered email to receive a secure password reset link.' },
  { category: '🔐 Account & Security', question: 'How do I verify my email?', answer: 'A verification email is sent upon registration. Click the link inside. If you missed it, you can request a new one from your profile settings.' },
  { category: '🔐 Account & Security', question: 'Why can’t I log in?', answer: 'Ensure you are using your official college email. Check your password, and ensure your account has not been suspended.' },
  { category: '🔐 Account & Security', question: 'How is my data protected?', answer: 'We use industry-standard 256-bit encryption for all data transmissions and securely hash all passwords. Your data is never sold to third parties.' },
  
  // General
  { category: '⚙️ General / Technical', question: 'Which browsers are supported?', answer: 'We support all modern browsers including Google Chrome, Mozilla Firefox, Safari, and Microsoft Edge.' },
  { category: '⚙️ General / Technical', question: 'Why is the website slow sometimes?', answer: 'Heavy traffic during exam seasons might cause slight delays. We continuously monitor and scale our servers to minimize this.' },
  { category: '⚙️ General / Technical', question: 'What should I do if something is not working?', answer: 'Try refreshing the page or clearing your browser cache. If the issue persists, submit a bug report via the sidebar.' },
  { category: '⚙️ General / Technical', question: 'How can I contact support?', answer: 'You can email our emergency support team or use the Contact Support button at the bottom of this page.' },
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const filteredFaqs = useMemo(() => {
    if (!searchQuery) return faqsData;
    const lowerQuery = searchQuery.toLowerCase();
    return faqsData.filter(faq => 
      faq.question.toLowerCase().includes(lowerQuery) || 
      faq.answer.toLowerCase().includes(lowerQuery) ||
      faq.category.toLowerCase().includes(lowerQuery)
    );
  }, [searchQuery]);

  const groupedFaqs = useMemo(() => {
    const groups = {};
    filteredFaqs.forEach((faq) => {
      if (!groups[faq.category]) groups[faq.category] = [];
      const actualIndex = faqsData.findIndex(f => f.question === faq.question);
      groups[faq.category].push({ ...faq, idx: actualIndex });
    });
    return groups;
  }, [filteredFaqs]);

  const toggleFaq = (idx) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto w-full">
      <SEO title="Help Center | Study Repository" />
      
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-4 text-text-main">How can we help you?</h1>
        <p className="text-text-muted max-w-xl mx-auto">
          Search for tutorials, read the documentation, or contact our support team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-panel border border-border rounded-2xl p-6 shadow-sm flex flex-col"
        >
          <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center mb-4">
            <FileText className="text-primary-500" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-text-main mb-2">Getting Started</h3>
          <p className="text-sm text-text-muted mb-4 flex-grow">Learn how to upload, download, and manage your academic resources effectively.</p>
          <a href="#getting-started" className="text-sm font-medium text-primary-500 hover:text-primary-400 transition-colors mt-auto">Read articles &rarr;</a>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="bg-panel border border-border rounded-2xl p-6 shadow-sm flex flex-col"
        >
          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
            <HelpCircle className="text-blue-500" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-text-main mb-2">FAQs</h3>
          <p className="text-sm text-text-muted mb-4 flex-grow">Find quick answers to the most commonly asked questions by students and faculty.</p>
          <a href="#faqs" className="text-sm font-medium text-blue-500 hover:text-blue-400 transition-colors mt-auto">Browse FAQs &rarr;</a>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="bg-panel border border-border rounded-2xl p-6 shadow-sm flex flex-col"
        >
          <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-4">
            <MessageCircle className="text-green-500" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-text-main mb-2">Community Support</h3>
          <p className="text-sm text-text-muted mb-4 flex-grow">Join our discord server to discuss with other students and get instant help.</p>
          <a href="#" className="text-sm font-medium text-green-500 hover:text-green-400 transition-colors mt-auto">Join Discord &rarr;</a>
        </motion.div>
      </div>

      {/* Detailed Getting Started Guide */}
      <div id="getting-started" className="mt-16 mb-8 scroll-mt-24">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-text-main mb-4">Platform Usage Guide</h2>
          <p className="text-text-muted max-w-2xl mx-auto">
            A quick overview of how to navigate and make the most out of the platform based on your account role.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* For Students */}
          <div className="bg-panel border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-6 border-b border-border pb-4">
              <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center">
                <GraduationCap className="text-primary-500" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-main">For Students</h3>
                <p className="text-xs text-text-muted mt-0.5">Discover and consume</p>
              </div>
            </div>
            <ul className="space-y-5">
              <li className="flex items-start gap-3">
                <div className="bg-surface p-2 rounded-lg text-text-main border border-border shrink-0 mt-0.5"><Search size={16} /></div>
                <div>
                  <p className="text-sm font-semibold text-text-main">Search & Find</p>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">Search for notes, past papers, or assignments by course and semester.</p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <div className="bg-surface p-2 rounded-lg text-text-main border border-border shrink-0 mt-0.5"><Download size={16} /></div>
                <div>
                  <p className="text-sm font-semibold text-text-main">Download Files</p>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">Use the download button on the resource page to save files locally for offline use.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-surface p-2 rounded-lg text-text-main border border-border shrink-0 mt-0.5"><Bookmark size={16} /></div>
                <div>
                  <p className="text-sm font-semibold text-text-main">Save & Bookmark</p>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">Bookmark important resources for quick access later in your personal dashboard.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* For Faculty */}
          <div className="bg-panel border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-6 border-b border-border pb-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <Users className="text-blue-500" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-main">For Faculty</h3>
                <p className="text-xs text-text-muted mt-0.5">Share and contribute</p>
              </div>
            </div>
            <ul className="space-y-5">
              <li className="flex items-start gap-3">
                <div className="bg-surface p-2 rounded-lg text-text-main border border-border shrink-0 mt-0.5"><Upload size={16} /></div>
                <div>
                  <p className="text-sm font-semibold text-text-main">Upload Resources</p>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">Easily upload class notes, presentation slides, and official assignments.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-surface p-2 rounded-lg text-text-main border border-border shrink-0 mt-0.5"><Settings size={16} /></div>
                <div>
                  <p className="text-sm font-semibold text-text-main">Manage Files</p>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">Organize, edit details, or remove your uploaded materials from the "My Files" area.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-surface p-2 rounded-lg text-text-main border border-border shrink-0 mt-0.5"><CheckSquare size={16} /></div>
                <div>
                  <p className="text-sm font-semibold text-text-main">Approval System</p>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">Uploaded materials are securely reviewed through an automated or administrative approval process before going live.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* For Admin */}
          <div className="bg-panel border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-6 border-b border-border pb-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                <Shield className="text-purple-500" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-main">For Admin</h3>
                <p className="text-xs text-text-muted mt-0.5">Govern and monitor</p>
              </div>
            </div>
            <ul className="space-y-5">
              <li className="flex items-start gap-3">
                <div className="bg-surface p-2 rounded-lg text-text-main border border-border shrink-0 mt-0.5"><UserCog size={16} /></div>
                <div>
                  <p className="text-sm font-semibold text-text-main">Manage Users</p>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">Oversee all accounts, verify roles, and ensure the community remains secure.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-surface p-2 rounded-lg text-text-main border border-border shrink-0 mt-0.5"><CheckCircle2 size={16} /></div>
                <div>
                  <p className="text-sm font-semibold text-text-main">Approve Uploads</p>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">Review pending resource submissions, ensuring quality and relevancy before publishing.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-surface p-2 rounded-lg text-text-main border border-border shrink-0 mt-0.5"><Activity size={16} /></div>
                <div>
                  <p className="text-sm font-semibold text-text-main">Monitor Activity</p>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">Track platform engagement, resolve user-reported bugs, and review analytics data.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div id="faqs" className="mt-20 mb-8 scroll-mt-24">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-text-main mb-4">Frequently Asked Questions</h2>
          <p className="text-text-muted max-w-2xl mx-auto mb-8">
            Browse our comprehensive FAQ to quickly find answers.
          </p>
          
          <div className="max-w-2xl mx-auto relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search for questions or keywords..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-panel border border-border rounded-2xl py-4 pl-12 pr-4 text-text-main focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm text-base"
            />
          </div>
        </div>

        {Object.keys(groupedFaqs).length > 0 ? (
          <div className="space-y-12 max-w-4xl mx-auto">
            {Object.entries(groupedFaqs).map(([category, faqs]) => (
              <div key={category} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-xl font-bold text-text-main mb-5 flex items-center gap-2 border-b border-border/50 pb-2">
                  {category}
                </h3>
                <div className="space-y-3">
                  {faqs.map((faq) => (
                    <div 
                      key={faq.idx} 
                      className={`bg-panel border rounded-2xl overflow-hidden transition-all duration-200 ${openFaqIndex === faq.idx ? 'border-primary-500/40 shadow-md ring-1 ring-primary-500/10' : 'border-border hover:border-border/80 hover:shadow-sm'}`}
                    >
                      <button 
                        onClick={() => toggleFaq(faq.idx)}
                        className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
                      >
                        <span className="font-semibold text-text-main pr-4 text-base">{faq.question}</span>
                        <ChevronDown 
                          size={20} 
                          className={`text-text-muted shrink-0 transition-transform duration-300 ${openFaqIndex === faq.idx ? 'rotate-180 text-primary-500' : ''}`} 
                        />
                      </button>
                      <AnimatePresence>
                        {openFaqIndex === faq.idx && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                          >
                            <div className="px-5 pb-5 text-sm text-text-muted leading-relaxed border-t border-border/40 pt-4">
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center flex flex-col items-center animate-in fade-in duration-500">
            <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mb-5 ring-1 ring-border/50">
              <SearchX size={36} className="text-text-muted/50" />
            </div>
            <h3 className="text-xl font-bold text-text-main mb-2">No matching FAQs found</h3>
            <p className="text-text-muted">Try using a different keyword or checking another category.</p>
            <button 
              onClick={() => setSearchQuery('')}
              className="mt-6 text-sm font-medium text-primary-500 hover:text-primary-400 px-6 py-2 bg-primary-500/10 rounded-full transition-colors"
            >
              Clear search
            </button>
          </div>
        )}
      </div>

      <div className="mt-16 bg-primary-500/5 border border-primary-500/20 rounded-3xl p-8 flex flex-col items-center text-center">
        <Mail className="text-primary-500 mb-4" size={32} />
        <h2 className="text-2xl font-bold text-text-main mb-2">Still need help?</h2>
        <p className="text-text-muted mb-6 max-w-md">
          Our support team is available 24/7 to help you with any issues you might face. Reach out to us directly via email at krishnabobade1313@gmail.com.
        </p>
        <a href="mailto:krishnabobade1313@gmail.com" className="px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors inline-flex items-center gap-2 shadow-sm hover:shadow-md">
          <Mail size={18} /> krishnabobade1313@gmail.com
        </a>
      </div>
    </div>
  );
}
