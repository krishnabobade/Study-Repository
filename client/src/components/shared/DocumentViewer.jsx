import { X, ExternalLink, Download, Maximize2, Minimize2, RefreshCw, FileText, ZoomIn, ZoomOut, RotateCcw, Eye } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export default function DocumentViewer({ url, type, title, onClose, onDownload }) {
  const [isClosing, setIsClosing] = useState(false)
  const [viewerProvider, setViewerProvider] = useState('google') // 'google' | 'office' | 'native'
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [textContent, setTextContent] = useState(null)
  const [loadingText, setLoadingText] = useState(false)
  const [imageZoom, setImageZoom] = useState(1)

  // Normalize type
  const t = (type || '').toLowerCase();
  
  const isImage = ['image', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].some(ext => t.includes(ext));
  const isPDF = t.includes('pdf');
  const isVideo = ['video', 'mp4', 'webm', 'ogg', 'mov'].some(ext => t.includes(ext));
  const isAudio = ['audio', 'mp3', 'wav', 'm4a', 'aac'].some(ext => t.includes(ext));
  const isOffice = ['doc', 'ppt', 'xls', 'word', 'excel', 'powerpoint', 'presentation', 'spreadsheet'].some(ext => t.includes(ext));
  const isText = ['txt', 'csv', 'json', 'md', 'code', 'js', 'html', 'css', 'py'].some(ext => t.includes(ext));

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  useEffect(() => {
    if (isText && url) {
      setLoadingText(true);
      fetch(url)
        .then(res => res.text())
        .then(data => setTextContent(data))
        .catch(() => setTextContent('Failed to load text content.'))
        .finally(() => setLoadingText(false));
    }
  }, [isText, url]);

  let safeUrl = url;
  try {
    const parsed = new URL(url);
    if (isOffice && !parsed.pathname.match(/\.[a-z]{3,4}$/i)) {
      const ext = t.includes('presentation') || t.includes('ppt') ? '.pptx' : t.includes('excel') || t.includes('xls') || t.includes('sheet') ? '.xlsx' : '.docx';
      parsed.pathname = `${parsed.pathname}${ext}`;
      safeUrl = parsed.toString();
    }
  } catch (e) {
    if (isOffice && !url.match(/\.[a-z]{3,4}($|\?)/i)) {
      const ext = t.includes('presentation') || t.includes('ppt') ? '.pptx' : t.includes('excel') || t.includes('xls') || t.includes('sheet') ? '.xlsx' : '.docx';
      safeUrl = `${url}${ext}`;
    }
  }

  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(safeUrl)}&embedded=true`;
  const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(safeUrl)}`;

  const viewerUrl = viewerProvider === 'office' 
    ? officeViewerUrl 
    : viewerProvider === 'google' 
    ? googleViewerUrl 
    : url;

  const handleClose = (e) => {
    if (e) e.stopPropagation();
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 150);
  };

  const isLocalUrl = url?.startsWith('blob:') || url?.startsWith('http://localhost');

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md"
      onClick={handleClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.15 }}
        className={`relative w-full ${isFullscreen ? 'h-full max-w-none' : 'h-[90vh] max-w-6xl'} bg-surface border border-border rounded-2xl overflow-hidden flex flex-col shadow-2xl transition-all duration-200`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border bg-panel/80 backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
            <div className="w-8 h-8 rounded-lg bg-ink-500/15 flex items-center justify-center shrink-0">
              <Eye size={18} className="text-ink-400" />
            </div>
            <div className="flex flex-col min-w-0">
              <h3 className="text-text-main font-semibold truncate text-xs sm:text-sm md:text-base">{title}</h3>
              <p className="text-text-muted text-[10px] uppercase font-mono tracking-wider">{type || 'Document'} Viewer</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Office / PDF Provider Toggle */}
            {(isOffice || isPDF) && !isLocalUrl && (
              <div className="hidden sm:flex items-center bg-surface border border-border rounded-lg p-0.5 text-xs mr-2">
                <button
                  onClick={() => setViewerProvider('google')}
                  className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${viewerProvider === 'google' ? 'bg-ink-500 text-white' : 'text-text-muted hover:text-text-main'}`}
                >
                  Google Engine
                </button>
                <button
                  onClick={() => setViewerProvider('office')}
                  className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${viewerProvider === 'office' ? 'bg-ink-500 text-white' : 'text-text-muted hover:text-text-main'}`}
                >
                  Microsoft Engine
                </button>
                <button
                  onClick={() => setViewerProvider('native')}
                  className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${viewerProvider === 'native' ? 'bg-ink-500 text-white' : 'text-text-muted hover:text-text-main'}`}
                >
                  Direct Mode
                </button>
              </div>
            )}

            {isImage && (
              <div className="flex items-center gap-1 bg-surface border border-border rounded-lg p-1 mr-1 text-xs">
                <button onClick={() => setImageZoom(z => Math.max(0.5, z - 0.25))} className="p-1 text-text-muted hover:text-text-main" title="Zoom Out">
                  <ZoomOut size={14} />
                </button>
                <span className="text-[11px] font-mono px-1 text-text-muted">{Math.round(imageZoom * 100)}%</span>
                <button onClick={() => setImageZoom(z => Math.min(3, z + 0.25))} className="p-1 text-text-muted hover:text-text-main" title="Zoom In">
                  <ZoomIn size={14} />
                </button>
                <button onClick={() => setImageZoom(1)} className="p-1 text-text-muted hover:text-text-main" title="Reset Zoom">
                  <RotateCcw size={13} />
                </button>
              </div>
            )}

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg bg-panel border border-border text-text-muted hover:text-text-main transition-all hidden xs:flex"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>

            {onDownload && (
              <button
                onClick={onDownload}
                className="p-2 rounded-lg bg-ink-500/10 border border-ink-500/20 text-ink-300 hover:bg-ink-500/20 transition-all flex items-center gap-1.5 text-xs font-medium"
                title="Download file"
              >
                <Download size={16} />
                <span className="hidden md:inline">Download</span>
              </button>
            )}

            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg bg-panel border border-border text-text-muted hover:text-text-main transition-all"
              title="Open in new tab"
            >
              <ExternalLink size={16} />
            </a>

            <button
              onClick={handleClose}
              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all ml-1"
              title="Close (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-surface/50 overflow-auto flex items-center justify-center relative p-2 sm:p-4">
          {isImage && (
            <div className="w-full h-full flex items-center justify-center overflow-auto">
              <img
                src={isClosing ? '' : url}
                alt={title}
                style={{ transform: `scale(${imageZoom})`, transition: 'transform 0.15s ease-out' }}
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              />
            </div>
          )}

          {isVideo && (
            <div className="w-full h-full flex items-center justify-center bg-black/40 rounded-xl overflow-hidden">
              <video src={isClosing ? '' : url} controls autoPlay className="max-w-full max-h-full rounded-lg" />
            </div>
          )}

          {isAudio && (
            <div className="card p-8 max-w-md w-full text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-ink-500/15 border border-ink-500/30 flex items-center justify-center mx-auto text-ink-400">
                <FileText size={36} />
              </div>
              <div>
                <h4 className="font-bold text-text-main text-lg mb-1">{title}</h4>
                <p className="text-text-muted text-xs">Audio File Preview</p>
              </div>
              <audio src={isClosing ? '' : url} controls className="w-full" />
            </div>
          )}

          {isPDF && (
            <div className="w-full h-full rounded-xl overflow-hidden bg-white border border-border flex flex-col">
              <object
                data={isClosing ? 'about:blank' : viewerUrl}
                type="application/pdf"
                className="w-full h-full border-none"
              >
                <iframe
                  src={isClosing ? 'about:blank' : googleViewerUrl}
                  className="w-full h-full border-none"
                  title={title}
                >
                  <div className="flex items-center justify-center h-full p-8 text-center bg-surface">
                    <div>
                      <h4 className="text-text-main font-medium mb-2">Native PDF Viewer Unavailable</h4>
                      <p className="text-text-muted text-sm mb-4">Your browser cannot render embedded PDFs directly.</p>
                      <a href={url} target="_blank" rel="noreferrer" className="btn-primary">
                        Open File in New Tab
                      </a>
                    </div>
                  </div>
                </iframe>
              </object>
            </div>
          )}

          {isOffice && (
            isLocalUrl ? (
              <div className="text-center p-8 max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-panel border border-border flex items-center justify-center mx-auto mb-4">
                  <ExternalLink size={32} className="text-text-muted/40" />
                </div>
                <h4 className="text-text-main font-medium text-base mb-2">Local Preview Unavailable</h4>
                <p className="text-text-muted text-sm mb-6 leading-relaxed">
                  Office files hosted locally on localhost cannot be rendered by online viewers. Download or open in a new tab.
                </p>
                <div className="flex justify-center gap-3">
                  <a href={url} target="_blank" rel="noreferrer" className="btn-secondary text-xs py-2 px-4">
                    Open File
                  </a>
                  {onDownload && (
                    <button onClick={onDownload} className="btn-primary text-xs py-2 px-4">
                      Download
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="w-full h-full rounded-xl overflow-hidden bg-white border border-border">
                <iframe
                  src={isClosing ? 'about:blank' : viewerUrl}
                  className="w-full h-full border-none"
                  title={title}
                />
              </div>
            )
          )}

          {isText && (
            <div className="w-full h-full rounded-xl bg-panel border border-border p-4 sm:p-6 overflow-auto font-mono text-xs sm:text-sm text-text-main">
              {loadingText ? (
                <div className="flex items-center justify-center h-full gap-2 text-text-muted">
                  <RefreshCw size={18} className="animate-spin text-ink-400" />
                  <span>Loading document content...</span>
                </div>
              ) : (
                <pre className="whitespace-pre-wrap break-words leading-relaxed">{textContent}</pre>
              )}
            </div>
          )}

          {!isImage && !isVideo && !isAudio && !isPDF && !isOffice && !isText && (
            <div className="text-center p-8 max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-panel border border-border flex items-center justify-center mx-auto mb-4">
                <ExternalLink size={32} className="text-text-muted/40" />
              </div>
              <h4 className="text-text-main font-medium text-base mb-2">Direct Preview Not Available</h4>
              <p className="text-text-muted text-sm mb-6 leading-relaxed">
                This file format (<span className="uppercase font-mono font-semibold">{type}</span>) cannot be previewed directly inside the web viewer. You can open or download it below.
              </p>
              <div className="flex justify-center gap-3">
                <a href={url} target="_blank" rel="noreferrer" className="btn-secondary text-xs py-2 px-4">
                  Open File
                </a>
                {onDownload && (
                  <button onClick={onDownload} className="btn-primary text-xs py-2 px-4">
                    Download File
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  )
}
