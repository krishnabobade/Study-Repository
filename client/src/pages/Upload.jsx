import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload as UploadIcon, File, X, CheckCircle, AlertCircle, Eye, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import useAuthStore from '../store/authStore'
import { MITWPU_SCHOOLS } from '../data/mitwpu'
import { censorText } from '../lib/profanity'

const COURSES   = ['BCA','MCA','B.Sc CS','B.Sc IT','B.Tech CS','B.Tech IT','MBA','Other']
const CATEGORIES = [
  { value: 'notes',      label: 'Lecture Notes' },
  { value: 'qpaper',     label: 'Question Paper' },
  { value: 'assignment', label: 'Assignment' },
  { value: 'lab',        label: 'Lab Manual' },
  { value: 'formula',    label: 'Formula Sheet' },
  { value: 'project',    label: 'Project Report' },
  { value: 'other',      label: 'Other' },
]

export default function Upload() {
  const [form, setForm]       = useState({ title:'', description:'', subject:'', course:'', semester:'', category:'', fileType:'' })
  const [file, setFile]       = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus]   = useState('idle') // idle | uploading | success | error
  const inputRef = useRef()

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleFile = f => {
    if (!f) return
    const allowed = ['application/pdf','application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg','image/png']
    if (!allowed.includes(f.type)) { toast.error('File type not supported'); return }
    if (f.size > 50 * 1024 * 1024) { toast.error('File too large (max 50 MB)'); return }
    
    // Auto-detect format to save user time
    let type = '';
    if (f.type.includes('pdf')) type = 'pdf';
    else if (f.type.includes('word')) type = 'doc';
    else if (f.type.includes('presentation') || f.type.includes('powerpoint')) type = 'ppt';
    else if (f.type.includes('image')) type = 'image';
    
    setForm(prev => ({ ...prev, fileType: type }));
    setFile(f)
    setStatus('idle')
  }

  const onDrop = e => {
    e.preventDefault(); setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!file) { toast.error('Please select a file'); return }
    const req = ['title','subject','course','semester','category','fileType']
    for (const k of req) if (!form[k]) { toast.error(`${k} is required`); return }

    const fd = new FormData()
    fd.append('file', file)
    
    const sanitizedForm = { ...form }
    if (sanitizedForm.title) sanitizedForm.title = censorText(sanitizedForm.title)
    if (sanitizedForm.description) sanitizedForm.description = censorText(sanitizedForm.description)
    if (sanitizedForm.subject) sanitizedForm.subject = censorText(sanitizedForm.subject)

    Object.entries(sanitizedForm).forEach(([k,v]) => fd.append(k, v))

    setStatus('uploading'); setProgress(0)
    try {
      await api.post('/resources', fd, {
        onUploadProgress: e => setProgress(Math.round((e.loaded * 100) / e.total)),
      })
      setStatus('success')
      toast.success('Submitted for admin approval!')
      useAuthStore.getState().refreshUser() // Update global stats
    } catch (err) {
      setStatus('error')
      toast.error(err.response?.data?.message || 'Upload failed')
    }
  }

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-text-main mb-1">Upload Resource</h1>
        <p className="text-text-muted text-sm">Share your study materials with fellow students</p>
      </div>

      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="card p-8 flex flex-col items-center text-center space-y-6 max-w-lg mx-auto border border-green-500/20 bg-green-500/[0.02]"
          >
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
              <CheckCircle size={36} />
            </div>
            
            <div className="space-y-2">
              <h2 className="font-display font-bold text-xl text-text-main">Submitted for Review!</h2>
              <p className="text-sm text-text-muted leading-relaxed">
                The file <span className="text-text-main font-semibold">"{form.title || file?.name}"</span> has been uploaded. After uploading a file, it will be submitted to the administrator for review and approval. Once approved, the file will be published and made available on the website dashboard.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setFile(null)
                  setForm({ title:'', description:'', subject:'', course:'', semester:'', category:'', fileType:'' })
                  setProgress(0)
                  setStatus('idle')
                }}
                className="btn-primary py-2.5 px-5 text-sm shrink-0"
              >
                Upload Another File
              </button>
              <Link
                to="/dashboard"
                className="px-5 py-2.5 bg-panel border border-border hover:bg-surface text-text-main rounded-xl text-sm font-semibold transition-colors inline-flex items-center justify-center gap-2"
              >
                Go to Dashboard
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Notice Banner */}
            <div className="flex gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-text-muted">
              <Clock size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-text-main mb-0.5">Admin Approval Process</p>
                <p>After uploading a file, it will be submitted to the administrator for review and approval. Once approved, the file will be published and made available on the website dashboard.</p>
              </div>
            </div>

            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => !file && inputRef.current?.click()}
              className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer
                ${dragOver ? 'border-ink-500 bg-ink-500/10' : 'border-border hover:border-ink-500/50 hover:bg-white/[0.02]'}
                ${file ? 'cursor-default' : ''}`}>
              <input ref={inputRef} type="file" className="hidden"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                onChange={e => handleFile(e.target.files[0])} />

              <AnimatePresence mode="wait">
                {!file ? (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-14 px-6 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-ink-500/15 flex items-center justify-center mb-4">
                      <UploadIcon size={24} className="text-ink-400" />
                    </div>
                    <p className="text-text-main/70 font-medium mb-1">Drag & drop your file here</p>
                    <p className="text-text-muted text-sm">or click to browse</p>
                    <p className="text-text-muted/40 text-xs mt-3">PDF, DOC, PPT, JPG, PNG · Max 50 MB</p>
                  </motion.div>
                ) : (
                  <motion.div key="file" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-4 p-5">
                    <div className="w-12 h-12 rounded-xl bg-ink-500/20 flex items-center justify-center shrink-0">
                      <File size={22} className="text-ink-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-main truncate">{file.name}</p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {status === 'uploading' && (
                        <div className="mt-2">
                          <div className="h-1.5 bg-panel border border-border rounded-full overflow-hidden">
                            <motion.div className="h-full bg-ink-500 rounded-full"
                              initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.2 }} />
                          </div>
                          <p className="text-xs text-ink-400 mt-1">{progress}%</p>
                        </div>
                      )}
                    </div>
                    {status !== 'uploading' && (
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => { setFile(null); setStatus('idle') }}
                          className="p-2 hover:bg-panel rounded-lg text-text-muted hover:text-text-main transition-colors">
                          <X size={16} />
                        </button>
                      </div>
                    )}
                    {status === 'error' && <AlertCircle size={20} className="text-red-400 shrink-0" />}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Metadata */}
            <div className="card p-5 space-y-4">
              <h2 className="font-semibold text-text-main text-sm">Resource Details</h2>

              <input className="input" placeholder="Title *" value={form.title} onChange={set('title')} required />
              <textarea className="input resize-none h-20 py-3" placeholder="Description (optional)"
                value={form.description} onChange={set('description')} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input className="input" placeholder="Subject * (e.g. Data Structures)" value={form.subject} onChange={set('subject')} required />
                <select className="select" value={form.fileType} onChange={set('fileType')} required>
                  <option value="">Document Format *</option>
                  <option value="pdf">PDF Document (.pdf)</option>
                  <option value="doc">Word Document (.doc, .docx)</option>
                  <option value="ppt">PowerPoint (.ppt, .pptx)</option>
                  <option value="image">Image (.jpg, .png)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select className="select" value={form.course} onChange={set('course')} required>
                  <option value="">Course *</option>
                  {MITWPU_SCHOOLS.map(school => (
                    <optgroup key={school.name} label={school.name}>
                      {school.courses.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </optgroup>
                  ))}
                </select>
                <select className="select" value={form.semester} onChange={set('semester')} required>
                  <option value="">Semester *</option>
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                </select>
                <select className="select" value={form.category} onChange={set('category')} required>
                  <option value="">Category *</option>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>

            <button type="submit" disabled={status === 'uploading'}
              className="btn-primary w-full justify-center py-3.5 text-base">
              {status === 'uploading'
                ? <><span className="w-4 h-4 border-2 border-border border-t-ink-500 rounded-full animate-spin" />Uploading…</>
                : <><UploadIcon size={16} />Upload Resource</>
              }
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
