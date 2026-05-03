import { X, ExternalLink, Download } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export default function DocumentViewer({ url, type, title, onClose, onDownload }) {
  const [isClosing, setIsClosing] = useState(false)
  
  // Normalize type
  const t = (type || '').toLowerCase();
  
  const isImage = ['image', 'jpg', 'jpeg', 'png', 'gif', 'webp'].some(ext => t.includes(ext));
  const isPDF = t.includes('pdf');
  const isVideo = ['video', 'mp4', 'webm', 'ogg'].some(ext => t.includes(ext));
  
  // For Office files we use Google Docs viewer. PDFs are rendered natively.
  const isOffice = ['doc', 'ppt', 'msword', 'presentation', 'wordprocessingml'].some(ext => t.includes(ext));
  
  let safeUrl = url;
  try {
    const parsed = new URL(url);
    if (isOffice && !parsed.pathname.match(/\.[a-z]{3,4}$/i)) {
      const ext = t.includes('presentation') || t.includes('ppt') ? '.pptx' : '.docx';
      parsed.pathname = `${parsed.pathname}${ext}`;
      safeUrl = parsed.toString();
    }
  } catch (e) {
    if (isOffice && !url.match(/\.[a-z]{3,4}($|\?)/i)) {
      const ext = t.includes('presentation') || t.includes('ppt') ? '.pptx' : '.docx';
      safeUrl = `${url}${ext}`;
    }
  }
  
  const viewerUrl = isOffice 
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(safeUrl)}&embedded=true` 
    : url

  const handleClose = (e) => {
    if (e) e.stopPropagation();
    setIsClosing(true);
    // 1. Immediately sets iframe src to about:blank (React state update)
    // 2. Gives the browser exactly enough time to clear the heavy GPU renderer process
    // 3. Then unmounts the DOM node cleanly
    setTimeout(() => {
      onClose();
    }, 10);
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 bg-surface/80 backdrop-blur-sm"
      onClick={handleClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="relative w-full h-full max-w-6xl bg-surface border border-border rounded-2xl overflow-hidden flex flex-col shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-panel/50">
            <div className="flex flex-col min-w-0">
              <h3 className="text-text-main font-semibold truncate text-sm md:text-base">{title}</h3>
              <p className="text-text-muted text-[10px] uppercase font-mono tracking-wider">{type} Viewer</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onDownload}
                className="p-2 rounded-lg bg-panel border border-border text-text-muted hover:text-text-main transition-all"
                title="Download"
              >
                <Download size={18} />
              </button>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-panel border border-border text-text-muted hover:text-text-main transition-all"
                title="Open in new tab"
              >
                <ExternalLink size={18} />
              </a>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all ml-2"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 bg-surface/50 overflow-auto flex items-center justify-center">
            {isImage && (
              <img src={isClosing ? '' : url} alt={title} className="max-w-full max-h-full object-contain" />
            )}
            
            {isVideo && (
              <video src={isClosing ? '' : url} controls className="max-w-full max-h-full" />
            )}

            {isPDF && (
              <object
                data={isClosing ? 'about:blank' : viewerUrl}
                type="application/pdf"
                className="w-full h-full border-none bg-white"
              >
                <div className="flex items-center justify-center h-full p-8 text-center bg-surface">
                  <div>
                    <h4 className="text-text-main font-medium mb-2">Native PDF Viewer Unavailable</h4>
                    <p className="text-text-muted text-sm mb-4">Your browser doesn't support embedded PDFs.</p>
                    <a href={viewerUrl} target="_blank" rel="noreferrer" className="btn-primary">
                      Open in New Tab
                    </a>
                  </div>
                </div>
              </object>
            )}

            {isOffice && (
              url.startsWith('blob:') || url.startsWith('http://localhost') ? (
                <div className="text-center p-8">
                  <div className="w-16 h-16 rounded-2xl bg-panel border border-border flex items-center justify-center mx-auto mb-4">
                    <ExternalLink size={32} className="text-text-muted/20" />
                  </div>
                  <h4 className="text-text-main font-medium mb-2">Local Preview Unavailable</h4>
                  <p className="text-text-muted text-sm mb-6">Office documents cannot be previewed locally before uploading.</p>
                </div>
              ) : (
                <iframe
                  src={isClosing ? 'about:blank' : viewerUrl}
                  className="w-full h-full border-none bg-white"
                  title={title}
                />
              )
            )}

            {!isImage && !isVideo && !isPDF && !isOffice && (
              <div className="text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-panel border border-border flex items-center justify-center mx-auto mb-4">
                  <ExternalLink size={32} className="text-text-muted/20" />
                </div>
                <h4 className="text-text-main font-medium mb-2">Preview not available for this file type</h4>
                <p className="text-text-muted text-sm mb-6">You can still download the file to view it on your device.</p>
                <button
                  onClick={onDownload}
                  className="btn-primary"
                >
                  <Download size={16} />
                  Download Now
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>,
      document.body
    )
  }
