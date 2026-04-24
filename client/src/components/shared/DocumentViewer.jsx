import { X, ExternalLink, Download } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function DocumentViewer({ url, type, title, onClose, onDownload }) {
  const isImage = type === 'image'
  const isPDF = type === 'pdf'
  const isVideo = type === 'video'
  
  // For Office files, we use Google Docs viewer
  const isOffice = ['doc', 'ppt'].includes(type)
  const viewerUrl = isOffice 
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true` 
    : url

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-surface/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
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
                onClick={onClose}
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
              <img src={url} alt={title} className="max-w-full max-h-full object-contain" />
            )}
            
            {isPDF && (
              <iframe
                src={`${url}#toolbar=0`}
                className="w-full h-full border-none bg-white"
                title={title}
              />
            )}

            {isVideo && (
              <video src={url} controls className="max-w-full max-h-full" />
            )}

            {isOffice && (
              <iframe
                src={viewerUrl}
                className="w-full h-full border-none bg-white"
                title={title}
              />
            )}

            {!isImage && !isPDF && !isVideo && !isOffice && (
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
      </motion.div>
    </AnimatePresence>
  )
}
