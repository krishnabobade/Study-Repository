import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Eye, Database, Lock, Globe, Cookie, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/shared/SEO';

const PolicySection = ({ icon: Icon, title, children }) => (
  <motion.div 
    initial={{ opacity: 0, x: -10 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    className="relative pl-12 pb-12 last:pb-0"
  >
    <div className="absolute left-0 top-0 w-8 h-8 rounded-lg bg-ink-500/10 border border-ink-500/20 flex items-center justify-center text-ink-400">
      <Icon size={18} />
    </div>
    <div className="absolute left-4 top-8 bottom-0 w-px bg-border last:hidden" />
    
    <h2 className="text-xl font-bold text-text-main mb-4">{title}</h2>
    <div className="text-text-muted leading-relaxed space-y-4 text-sm md:text-base">
      {children}
    </div>
  </motion.div>
);

export default function PrivacyPolicy() {
  const privacySchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Privacy Policy - Study Repository",
    "description": "Read the Privacy Policy of Study Repository to learn how we protect your personal and academic information.",
    "publisher": {
      "@type": "EducationalOrganization",
      "name": "Study Repository",
      "logo": "https://study-repository-ten.vercel.app/logo.png"
    }
  };

  return (
    <div className="min-h-screen bg-surface selection:bg-ink-500/30">
      <SEO 
        title="Privacy Policy | Study Repository" 
        description="Learn how we collect, use, and safeguard your personal information within the Study Repository ecosystem."
        url="https://study-repository-ten.vercel.app/privacy-policy"
        schema={privacySchema}
      />
      
      {/* Header */}
      <div className="relative overflow-hidden bg-panel/50 border-b border-border py-20">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:24px_24px]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-ink-500/5 rounded-full blur-[120px] -z-10" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-ink-400 hover:text-ink-300 text-sm font-medium mb-8 transition-colors">
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-text-main mb-6 tracking-tight">Privacy Policy</h1>
          <p className="text-text-muted text-lg max-w-2xl leading-relaxed">
            Your privacy is our priority. This policy explains how we collect, use, and protect your personal information within the Study Repository ecosystem.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="card p-8 md:p-12 border border-white/5 shadow-2xl">
          <PolicySection icon={Eye} title="1. Information We Collect">
            <p>
              We collect information that you provide directly to us when you create an account, such as your full name, institutional email address (@mitwpu.edu.in), and academic details.
            </p>
            <p>
              When you use our services, we also automatically collect certain technical information, including your IP address, browser type, and interaction data to improve your experience.
            </p>
          </PolicySection>

          <PolicySection icon={Database} title="2. How We Use Your Data">
            <p>
              We process your information for purposes based on legitimate institutional interests, the fulfillment of our contract with you, compliance with our legal obligations, and/or your consent.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>To facilitate account creation and logon process.</li>
              <li>To manage user accounts and provide academic resources.</li>
              <li>To send administrative information and updates.</li>
              <li>To protect our Services and ensure academic integrity.</li>
            </ul>
          </PolicySection>

          <PolicySection icon={ShieldCheck} title="3. Data Protection & Security">
            <p>
              We implement a variety of security measures to maintain the safety of your personal information. All passwords are encrypted using industry-standard hashing algorithms (bcrypt).
            </p>
            <p>
              Sensitive data transmission is protected via Secure Socket Layer (SSL/TLS) technology. Access to your personal data is restricted to authorized personnel who are required to keep the information confidential.
            </p>
          </PolicySection>

          <PolicySection icon={Cookie} title="4. Cookies and Tracking">
            <p>
              We use cookies to help us remember and process your preferences, and understand and save user's preferences for future visits. These cookies are essential for the security and functionality of the login system.
            </p>
            <p>
              By using our platform, you consent to our use of these essential cookies. You can manage your cookie preferences through your browser settings at any time.
            </p>
          </PolicySection>

          <PolicySection icon={Lock} title="5. Data Retention">
            <p>
              We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy policy, unless a longer retention period is required or permitted by law (such as tax, accounting or other legal requirements).
            </p>
          </PolicySection>

          <div className="mt-12 pt-12 border-t border-border flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-ink-500/10 flex items-center justify-center mb-6">
              <Globe className="text-ink-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-text-main mb-2">Global Compliance</h3>
            <p className="text-text-muted text-sm max-w-sm mb-8">
              We strive to comply with international data protection standards to ensure your information is handled with the highest level of care.
            </p>
            <p className="text-text-muted/40 text-xs uppercase font-bold tracking-widest">
              Version 1.4 • Effective May 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
