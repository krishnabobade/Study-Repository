import { memo } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Book, FileText, GraduationCap, Globe, Code, PenTool, Layout, Box, Server, BookCopy, Monitor } from 'lucide-react'

// Reduced density to fix severe performance issues on the Login page
const BACKGROUND_ELEMENTS = [
  // Original Base Layer
  { Icon: Book, size: 40, x: '8%', y: '15%', b: 'blur-sm', op: 'opacity-70', r: -10, d: 0 },
  { Icon: FileText, size: 70, x: '35%', y: '8%', b: 'blur-md', op: 'opacity-50', r: 15, d: 1 },
  { Icon: Box, size: 55, x: '82%', y: '12%', b: 'blur-sm', op: 'opacity-60', r: -5, d: 2 },
  { Icon: Globe, size: 100, x: '5%', y: '50%', b: 'blur-lg', op: 'opacity-40', r: 25, d: 1.5 },
  { Icon: Layout, size: 45, x: '25%', y: '80%', b: 'blur-sm', op: 'opacity-60', r: -12, d: 0.5 },
  { Icon: BookCopy, size: 90, x: '75%', y: '45%', b: 'blur-lg', op: 'opacity-40', r: 8, d: 2.5 },
  { Icon: Code, size: 35, x: '90%', y: '60%', b: 'blur-sm', op: 'opacity-70', r: -20, d: 1 },
  { Icon: Server, size: 50, x: '50%', y: '85%', b: 'blur-md', op: 'opacity-50', r: 30, d: 3 },
  { Icon: GraduationCap, size: 110, x: '85%', y: '85%', b: 'blur-lg', op: 'opacity-40', r: -15, d: 0.8 },
  { Icon: Monitor, size: 60, x: '15%', y: '85%', b: 'blur-md', op: 'opacity-50', r: 10, d: 2.2 },
  { Icon: PenTool, size: 40, x: '60%', y: '15%', b: 'blur-none', op: 'opacity-70', r: -8, d: 1.2 },
  
  // Mid-Density Distribution (Filtered)
  { Icon: BookOpen, size: 45, x: '65%', y: '30%', b: 'blur-sm', op: 'opacity-60', r: 18, d: 0.5 },
  { Icon: FileText, size: 30, x: '45%', y: '50%', b: 'blur-none', op: 'opacity-70', r: -5, d: 1.8 },
  { Icon: Box, size: 35, x: '55%', y: '60%', b: 'blur-sm', op: 'opacity-60', r: -15, d: 2.4 },
  { Icon: GraduationCap, size: 40, x: '40%', y: '15%', b: 'blur-sm', op: 'opacity-70', r: 12, d: 0.2 },

  // Additional 15 Floating Elements (5 Low Opacity, 5 Medium Opacity, 5 High Opacity)
  // Low Opacity (5 elements)
  { Icon: Globe, size: 85, x: '18%', y: '35%', b: 'blur-lg', op: 'opacity-30', r: 10, d: 1.1 },
  { Icon: BookCopy, size: 75, x: '60%', y: '75%', b: 'blur-lg', op: 'opacity-30', r: -18, d: 2.1 },
  { Icon: GraduationCap, size: 95, x: '42%', y: '90%', b: 'blur-lg', op: 'opacity-30', r: 22, d: 0.7 },
  { Icon: Server, size: 80, x: '78%', y: '25%', b: 'blur-lg', op: 'opacity-40', r: -12, d: 1.9 },
  { Icon: FileText, size: 90, x: '12%', y: '68%', b: 'blur-lg', op: 'opacity-30', r: 15, d: 2.8 },

  // Medium Opacity (5 elements)
  { Icon: Code, size: 45, x: '30%', y: '22%', b: 'blur-sm', op: 'opacity-55', r: -8, d: 0.9 },
  { Icon: Layout, size: 50, x: '70%', y: '18%', b: 'blur-sm', op: 'opacity-60', r: 14, d: 1.4 },
  { Icon: Box, size: 40, x: '20%', y: '78%', b: 'blur-sm', op: 'opacity-55', r: -25, d: 2.3 },
  { Icon: Monitor, size: 55, x: '88%', y: '40%', b: 'blur-md', op: 'opacity-60', r: 8, d: 0.4 },
  { Icon: BookOpen, size: 50, x: '48%', y: '40%', b: 'blur-sm', op: 'opacity-55', r: -15, d: 1.7 },

  // High Opacity (5 elements)
  { Icon: PenTool, size: 38, x: '15%', y: '42%', b: 'blur-none', op: 'opacity-75', r: 12, d: 1.3 },
  { Icon: Book, size: 42, x: '82%', y: '72%', b: 'blur-none', op: 'opacity-80', r: -10, d: 0.6 },
  { Icon: Code, size: 36, x: '52%', y: '70%', b: 'blur-none', op: 'opacity-75', r: 20, d: 2.0 },
  { Icon: GraduationCap, size: 44, x: '28%', y: '62%', b: 'blur-none', op: 'opacity-80', r: -14, d: 2.7 },
  { Icon: FileText, size: 38, x: '72%', y: '88%', b: 'blur-none', op: 'opacity-75', r: 5, d: 1.0 },
];

const AnimatedBackground = memo(() => {
  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-ink-500/5 via-transparent to-transparent pointer-events-none" />
      <motion.div 
        animate={{ opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[10%] left-[20%] w-[600px] h-[600px] bg-ink-500/5 rounded-full blur-[140px] pointer-events-none transform-gpu" 
      />
      <motion.div 
        animate={{ opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] bg-panel rounded-full blur-[160px] pointer-events-none transform-gpu" 
      />

      <div className="absolute inset-0 z-0 opacity-100 pointer-events-none">
        {BACKGROUND_ELEMENTS.map((item, i) => (
          <motion.div
            key={i}
            className={`absolute ${item.b} ${item.op} text-text-main/10 pointer-events-none transform-gpu will-change-transform`}
            style={{ left: item.x, top: item.y }}
            initial={{ rotate: item.r }}
            animate={{ 
              y: [0, -30, 0],
              x: [0, (i % 2 === 0 ? 15 : -15), 0],
              rotate: [item.r, item.r + 15, item.r]
            }}
            transition={{ 
              duration: 25 + (i * 1.5), 
              repeat: Infinity, 
              ease: "linear",
              delay: item.d
            }}
          >
            <item.Icon size={item.size} strokeWidth={1.5} />
          </motion.div>
        ))}
      </div>
    </>
  );
});

export default AnimatedBackground;
