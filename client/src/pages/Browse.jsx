import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import api from '../services/api'
import ResourceCard from '../components/shared/ResourceCard'
import { SkeletonCard, SkeletonTitle, SkeletonText, SkeletonButton, SkeletonResourceCard } from '../components/shared/Skeleton'
import { getFlatCourses } from '../data/mitwpu'

const COURSES = getFlatCourses()
const CATEGORIES = ['notes', 'qpaper', 'assignment', 'lab', 'formula', 'project', 'other']
const FILE_TYPES = ['pdf', 'doc', 'ppt', 'image', 'video']
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8]

function useDebounce(val, delay = 300) {
  const [debounced, setDebounced] = useState(val)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(val), delay)
    return () => clearTimeout(t)
  }, [val, delay])
  return debounced
}

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [resources, setResources] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [filters, setFilters] = useState({
    course: searchParams.get('course') || '',
    semester: searchParams.get('semester') || '',
    category: searchParams.get('category') || '',
    fileType: searchParams.get('fileType') || '',
  })
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1)
  const [showFilters, setShowFilters] = useState(false)

  const debouncedSearch = useDebounce(search)

  // Reactive URL-to-State Sync Effect
  useEffect(() => {
    const q = searchParams.get('q') || ''
    const course = searchParams.get('course') || ''
    const semester = searchParams.get('semester') || ''
    const category = searchParams.get('category') || ''
    const fileType = searchParams.get('fileType') || ''
    const pageNum = parseInt(searchParams.get('page')) || 1

    setSearch(q)
    setFilters({ course, semester, category, fileType })
    setPage(pageNum)
  }, [searchParams])

  const fetchResources = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 12 })
      if (debouncedSearch) params.set('search', debouncedSearch)
      Object.entries(filters).forEach(([k, v]) => v && params.set(k, v))
      const { data } = await api.get(`/resources?${params}`)
      setResources(data.resources)
      setPagination(data.pagination)
    } catch {}
    finally { setLoading(false) }
  }, [debouncedSearch, filters, page])

  useEffect(() => { fetchResources() }, [fetchResources])

  // Sync Search state to URL on debounced value changes
  useEffect(() => {
    const urlQ = searchParams.get('q') || ''
    if (debouncedSearch !== urlQ) {
      const nextParams = new URLSearchParams(searchParams)
      if (debouncedSearch) {
        nextParams.set('q', debouncedSearch)
      } else {
        nextParams.delete('q')
      }
      nextParams.set('page', '1') // reset page on search
      setSearchParams(nextParams)
    }
  }, [debouncedSearch])

  const setFilter = (k, v) => {
    const currentValue = filters[k]
    const nextValue = v === currentValue ? '' : v
    
    const nextParams = new URLSearchParams(searchParams)
    if (nextValue) {
      nextParams.set(k, nextValue)
    } else {
      nextParams.delete(k)
    }
    nextParams.set('page', '1')
    setSearchParams(nextParams)
  }

  const clearFilters = () => {
    setSearchParams(new URLSearchParams())
  }

  const handlePageChange = (pageNum) => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('page', pageNum.toString())
    setSearchParams(nextParams)
  }

  const hasFilters = Object.values(filters).some(Boolean) || search

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-text-main mb-1">Browse Resources</h1>
        <p className="text-text-muted text-sm">Discover study materials shared by your peers</p>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search notes, subjects, files…"
            className="input pl-11 w-full" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-muted">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex gap-2.5 sm:gap-3 w-full sm:w-auto">
          <button onClick={() => setShowFilters(f => !f)}
            className={`btn-ghost border flex-1 sm:flex-initial justify-center ${showFilters ? 'border-ink-500/50 text-ink-300' : 'border-border'}`}>
            <SlidersHorizontal size={15} />
            Filters
            {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-ink-400" />}
          </button>
          {hasFilters && (
            <button onClick={clearFilters} className="btn-ghost border border-border/30 hover:border-red-500/20 text-red-400 hover:text-red-300 flex-1 sm:flex-initial justify-center">
              <X size={14} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="card p-4 mb-4 overflow-hidden">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-[13px] md:text-xs text-text-muted mb-2 font-medium">Category</p>
              <div className="flex flex-wrap gap-2 md:gap-1.5">
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setFilter('category', c)}
                    className={`px-3 md:px-2.5 py-1.5 md:py-1 rounded-lg text-[13px] md:text-xs font-medium transition-all capitalize
                                ${filters.category === c ? 'bg-ink-500 text-white' : 'bg-panel border border-border text-text-muted hover:bg-card hover:text-text-main'}`}>
                    {c === 'qpaper' ? 'Q. Paper' : c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[13px] md:text-xs text-text-muted mb-2 font-medium">Course</p>
              <div className="flex flex-wrap gap-2 md:gap-1.5">
                {COURSES.map(c => (
                  <button key={c} onClick={() => setFilter('course', c)}
                    className={`px-3 md:px-2.5 py-1.5 md:py-1 rounded-lg text-[13px] md:text-xs font-medium transition-all
                                ${filters.course === c ? 'bg-ink-500 text-white' : 'bg-panel border border-border text-text-muted hover:bg-card hover:text-text-main'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[13px] md:text-xs text-text-muted mb-2 font-medium">Semester</p>
              <div className="flex flex-wrap gap-2 md:gap-1.5">
                {SEMESTERS.map(s => (
                  <button key={s} onClick={() => setFilter('semester', s)}
                    className={`w-10 h-10 md:w-9 md:h-9 rounded-lg text-[13px] md:text-xs font-medium transition-all
                                ${filters.semester == s ? 'bg-ink-500 text-white' : 'bg-panel border border-border text-text-muted hover:bg-card hover:text-text-main'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[13px] md:text-xs text-text-muted mb-2 font-medium">File Type</p>
              <div className="flex flex-wrap gap-2 md:gap-1.5">
                {FILE_TYPES.map(t => (
                  <button key={t} onClick={() => setFilter('fileType', t)}
                    className={`px-3 md:px-2.5 py-1.5 md:py-1 rounded-lg text-[13px] md:text-xs font-medium transition-all uppercase
                                ${filters.fileType === t ? 'bg-ink-500 text-white' : 'bg-panel border border-border text-text-muted hover:bg-card hover:text-text-main'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Results */}
      {loading
        ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
            {[...Array(9)].map((_, i) => <SkeletonResourceCard key={i} />)}
          </div>
        : resources.length === 0
          ? <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card p-12 mt-4 flex flex-col items-center justify-center text-center border-dashed border-2 border-border/50 bg-gradient-to-b from-surface to-panel"
            >
              <div className="w-20 h-20 bg-ink-500/10 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <Search size={36} className="text-ink-500" />
              </div>
              <h3 className="text-xl font-bold text-text-main mb-2">No resources found</h3>
              <p className="text-text-muted max-w-sm mb-6">
                We couldn't find any study materials matching your current filters. Try searching for a different topic or clearing your filters.
              </p>
              {hasFilters && (
                <button 
                  onClick={clearFilters}
                  className="px-6 py-2.5 bg-panel border border-border hover:bg-surface text-text-main rounded-xl font-medium transition-colors shadow-sm"
                >
                  Clear all filters
                </button>
              )}
            </motion.div>
          : <>
              <p className="text-xs text-text-muted mb-4">{pagination.total} resource{pagination.total !== 1 ? 's' : ''} found</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {resources.map((r, i) => (
                  <motion.div key={r._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}>
                    <ResourceCard resource={r} />
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {[...Array(pagination.pages)].map((_, i) => (
                    <button key={i} onClick={() => handlePageChange(i + 1)}
                      className={`w-9 h-9 rounded-xl text-sm font-medium transition-all
                                  ${page === i + 1 ? 'bg-ink-500 text-white' : 'bg-panel border border-border text-text-muted hover:bg-panel/80'}`}>
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
      }
    </div>
  )
}
