import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { BookOpen, GraduationCap, Globe, Award, Laptop, Zap, ChevronRight } from 'lucide-react'
import { MITWPU_SCHOOLS, MITWPU_HIGHLIGHTS } from '../data/mitwpu'

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
}

const listContainerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.2 } }
}

const listItemVariants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } }
}

export default function Programs() {
  const iconMap = {
    'Interdisciplinary Learning': Zap,
    'World-Class Infrastructure': Laptop,
    'Global Exposure': Globe,
    'Degree++ & Experiential Learning': Award
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-16 pb-24 relative">
      {/* Background Parallax Orbs */}
      <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-ink-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto pt-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, rotate: -15 }} 
          animate={{ opacity: 1, scale: 1, rotate: 0 }} 
          transition={{ duration: 0.8, type: 'spring', bounce: 0.5 }}
          className="w-24 h-24 rounded-[32px] bg-panel border border-border flex items-center justify-center mx-auto mb-8 ring-1 ring-border shadow-2xl shadow-ink-500/20"
        >
          <GraduationCap size={44} className="text-ink-400" />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2, duration: 0.6 }}
          className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-text-main mb-6 tracking-tight bg-clip-text"
        >
          Academic Edge at MIT-WPU
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-text-muted text-lg md:text-xl font-medium leading-relaxed"
        >
          Explore over 150+ undergraduate, postgraduate, and doctoral programs across multiple disciplines explicitly designed to engineer the future.
        </motion.p>
      </div>

      {/* Highlights / Features */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
      >
        {MITWPU_HIGHLIGHTS.map((h) => {
          const Icon = iconMap[h.title] || BookOpen
          return (
            <motion.div 
              key={h.title} 
              variants={itemVariants}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="card relative overflow-hidden group cursor-pointer border border-white/5 hover:border-border transition-colors p-6"
            >
              <div className="absolute -right-8 -top-8 w-32 h-32 blur-3xl rounded-full bg-ink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <motion.div 
                className="w-14 h-14 rounded-2xl bg-panel flex items-center justify-center mb-5 border border-border shadow-inner"
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                <Icon size={26} className="text-ink-400 group-hover:text-ink-300 transition-colors" />
              </motion.div>
              
              <h3 className="text-text-main font-bold text-lg mb-2 relative z-10">{h.title}</h3>
              <p className="text-text-muted text-sm leading-relaxed relative z-10">{h.description}</p>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Schools & Courses */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-8 ml-1">
          <motion.div 
            animate={{ rotate: [0, 10, -10, 0] }} 
            transition={{ repeat: Infinity, duration: 3, delay: 1 }}
            className="w-10 h-10 rounded-xl bg-ink-500/20 flex items-center justify-center"
          >
            <BookOpen size={20} className="text-ink-400" />
          </motion.div>
          <h2 className="font-display font-bold text-3xl text-text-main tracking-tight">
            Schools & Departments
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {MITWPU_SCHOOLS.map((school, i) => (
            <motion.div 
              key={school.name} 
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
              className="card overflow-hidden flex flex-col border border-white/5 hover:border-white/15 transition-colors shadow-xl shadow-black/20"
            >
              {/* School Header */}
              <div className="p-6 bg-gradient-to-br from-panel/50 to-transparent border-b border-border relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full bg-grid-white/[0.02] bg-[length:16px_16px]" />
                <h3 className="font-display font-bold text-text-main text-lg relative z-10 leading-tight pr-10">{school.name}</h3>
                <div className="mt-3 flex items-center gap-2 relative z-10">
                  <span className="flex h-2 w-2 rounded-full bg-ink-500" />
                  <p className="text-ink-300 font-semibold text-xs uppercase tracking-wider">{school.courses.length} Programs</p>
                </div>
              </div>

              {/* Programs List */}
              <motion.div 
                variants={listContainerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="p-3 flex-1"
              >
                <div className="space-y-1.5">
                  {school.courses.map(course => (
                    <Link
                      key={course.name}
                      to={`/browse?course=${encodeURIComponent(course.name)}`}
                      className="block"
                    >
                      <motion.div 
                        variants={listItemVariants}
                        className="flex flex-col px-4 py-3 rounded-xl transition-all cursor-pointer group border border-transparent hover:border-border hover:bg-panel/50"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-text-main/80 font-medium text-[15px] group-hover:text-text-main transition-colors">{course.name}</span>
                          <ChevronRight size={16} className="text-text-main/0 group-hover:text-ink-400 shrink-0 transition-all -translate-x-2 group-hover:translate-x-0" />
                        </div>
                        <div className="flex gap-2 mt-2 items-center">
                          <span className="text-[10px] uppercase font-bold text-ink-200 bg-ink-500/20 px-2 py-0.5 rounded shadow-sm border border-ink-500/10">
                            {course.type}
                          </span>
                          <span className="text-[11px] font-medium text-text-muted">{course.duration}</span>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.div>

    </div>
  )
}
