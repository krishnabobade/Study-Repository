import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, FileText, CheckCircle, Scale, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/shared/SEO';

const Section = ({ icon: Icon, title, children }) => (
  <motion.section 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="bg-panel/40 border border-border rounded-2xl p-6 md:p-8"
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-xl bg-ink-500/10 flex items-center justify-center border border-ink-500/20">
        <Icon size={20} className="text-ink-400" />
      </div>
      <h2 className="text-xl font-bold text-text-main">{title}</h2>
    </div>
    <div className="text-text-muted leading-relaxed space-y-4 text-sm md:text-base">
      {children}
    </div>
  </motion.section>
);

export default function Terms() {
  const termsSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Terms and Conditions - Study Repository",
    "description": "Terms of Use and binding user conditions for using the Study Repository educational platform.",
    "publisher": {
      "@type": "EducationalOrganization",
      "name": "Study Repository",
      "logo": "https://study-repository-ten.vercel.app/logo.png"
    }
  };

  return (
    <div className="min-h-screen bg-surface selection:bg-ink-500/30">
      <SEO 
        title="Terms & Conditions | Study Repository" 
        description="Please read these terms carefully before using the Study Repository platform. By accessing our services, you agree to these binding terms."
        url="https://study-repository-ten.vercel.app/terms"
        schema={termsSchema}
      />
      
      {/* Hero Section */}
      <div className="bg-panel/50 border-b border-border py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ink-500/10 border border-ink-500/20 text-ink-400 text-xs font-bold uppercase tracking-wider mb-6"
          >
            <Scale size={14} /> Legal Documentation
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black text-text-main mb-6 tracking-tight">Terms & Conditions</h1>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
            Please read these terms carefully before using the Study Repository platform. By accessing our services, you agree to these binding terms.
          </p>
          <p className="text-text-muted/40 text-xs mt-8 uppercase font-bold tracking-widest">
            Last Updated: May 2026 • Version 2.1
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-20 space-y-8">
        <Section icon={FileText} title="1. Agreement to Terms">
          <p>
            These Terms of Use constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and Study Repository ("we," "us" or "our"), concerning your access to and use of our website and services.
          </p>
          <p>
            You agree that by accessing the Service, you have read, understood, and agree to be bound by all of these Terms of Use. If you do not agree with all of these Terms of Use, then you are expressly prohibited from using the Service and you must discontinue use immediately.
          </p>
        </Section>

        <Section icon={Lock} title="2. User Account & Security">
          <p>
            To access certain features, you must register for an account using your official institutional email address (@mitwpu.edu.in). You are responsible for maintaining the confidentiality of your account password and are fully responsible for all activities that occur under your account.
          </p>
          <p>
            We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate, obscene, or otherwise objectionable.
          </p>
        </Section>

        <Section icon={CheckCircle} title="3. Content Guidelines & Academic Integrity">
          <p>
            The Study Repository is intended for the sharing of academic materials to aid learning. Users are strictly prohibited from:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Uploading materials that violate copyright laws or institutional intellectual property policies.</li>
            <li>Sharing answer keys for active examinations or ongoing assessments.</li>
            <li>Uploading content that contains viruses, malware, or any other harmful code.</li>
            <li>Posting content that is defamatory, obscene, or promotes discrimination.</li>
          </ul>
          <p>
            Failure to comply with these guidelines may result in immediate account suspension and reporting to the relevant institutional authorities.
          </p>
        </Section>

        <Section icon={Shield} title="4. Intellectual Property Rights">
          <p>
            Unless otherwise indicated, the Service is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us.
          </p>
          <p>
            By uploading content to the platform, you grant us a worldwide, non-exclusive, royalty-free license to host, store, use, display, reproduce, and distribute such content for the purposes of providing the Service.
          </p>
        </Section>

        <Section icon={AlertTriangle} title="5. Limitation of Liability">
          <p>
            In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit, lost revenue, loss of data, or other damages arising from your use of the service.
          </p>
        </Section>

        {/* Footer actions */}
        <div className="pt-10 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-border">
          <div className="text-text-muted text-sm">
            Questions? Contact <a href="mailto:krishnabobade1313@gmail.com" className="text-ink-400 hover:underline">krishnabobade1313@gmail.com</a>
          </div>
          <Link to="/dashboard" className="flex items-center gap-2 px-6 py-3 bg-panel border border-border rounded-xl text-text-main font-semibold hover:bg-surface transition-all">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
