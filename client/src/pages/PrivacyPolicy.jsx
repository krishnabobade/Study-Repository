import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-6 text-white">Privacy Policy</h1>
        <div className="card p-8 space-y-6 text-white/80">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">1. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as when you create an account, upload study materials, or communicate with us. This may include your name, email address, password, and educational information.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">2. How We Use Information</h2>
            <p>We use the information we collect to provide, maintain, and improve our services, to communicate with you, and to personalize your experience. We do not sell your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">3. Data Security</h2>
            <p>We take robust security measures to protect your information, including encryption of passwords and secure connections (HTTPS). However, no system is entirely secure, and we cannot guarantee complete security.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">4. Cookies</h2>
            <p>We use cookies to enhance your experience, remember your preferences, and track analytics. You can control cookies through your browser settings.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">5. Changes to This Policy</h2>
            <p>We may update this policy periodically. We will notify you of any changes by posting the new policy on this page.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
