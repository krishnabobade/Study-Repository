import React from 'react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-6 text-text-main">Terms & Conditions</h1>
        <div className="card p-8 space-y-6 text-text-muted">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2 className="text-xl font-semibold mb-3 text-text-main">1. Acceptance of Terms</h2>
            <p>By accessing or using our service, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-text-main">2. User Content</h2>
            <p>You retain your rights to any content you submit, post or display. By uploading content, you grant us a license to use, reproduce, and distribute that content within our platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-text-main">3. Prohibited Content</h2>
            <p>You may not upload viruses, malware, or any copyrighted content without permission. We reserve the right to remove any content that violates these rules.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-text-main">4. Termination</h2>
            <p>We may terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
