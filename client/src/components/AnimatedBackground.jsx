import { memo } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Book, FileText, GraduationCap, Globe, Code, PenTool, Layout, Box, Server, BookCopy, Monitor } from 'lucide-react'

// Absurd Density Expansion: Total ~208 elements. 
// Opacities cranked to maximum absolute visibility.
const BACKGROUND_ELEMENTS = [
  // Original Base Layer
  { Icon: Book, size: 40, x: '8%', y: '15%', b: 'blur-sm', op: 'opacity-90', r: -10, d: 0 },
  { Icon: FileText, size: 70, x: '35%', y: '8%', b: 'blur-md', op: 'opacity-90', r: 15, d: 1 },
  { Icon: Box, size: 55, x: '82%', y: '12%', b: 'blur-sm', op: 'opacity-100', r: -5, d: 2 },
  { Icon: Globe, size: 100, x: '5%', y: '50%', b: 'blur-lg', op: 'opacity-70', r: 25, d: 1.5 },
  { Icon: Layout, size: 45, x: '25%', y: '80%', b: 'blur-sm', op: 'opacity-100', r: -12, d: 0.5 },
  { Icon: BookCopy, size: 90, x: '75%', y: '45%', b: 'blur-lg', op: 'opacity-90', r: 8, d: 2.5 },
  { Icon: Code, size: 35, x: '90%', y: '60%', b: 'blur-sm', op: 'opacity-100', r: -20, d: 1 },
  { Icon: Server, size: 50, x: '50%', y: '85%', b: 'blur-md', op: 'opacity-90', r: 30, d: 3 },
  { Icon: GraduationCap, size: 110, x: '85%', y: '85%', b: 'blur-lg', op: 'opacity-70', r: -15, d: 0.8 },
  { Icon: Monitor, size: 60, x: '15%', y: '85%', b: 'blur-md', op: 'opacity-90', r: 10, d: 2.2 },
  { Icon: PenTool, size: 40, x: '60%', y: '15%', b: 'blur-none', op: 'opacity-100', r: -8, d: 1.2 },
  
  // Mid-Density Distribution
  { Icon: Globe, size: 85, x: '25%', y: '35%', b: 'blur-lg', op: 'opacity-90', r: -25, d: 3.5 },
  { Icon: BookOpen, size: 45, x: '65%', y: '30%', b: 'blur-sm', op: 'opacity-100', r: 18, d: 0.5 },
  { Icon: FileText, size: 30, x: '45%', y: '50%', b: 'blur-none', op: 'opacity-100', r: -5, d: 1.8 },
  { Icon: Code, size: 120, x: '35%', y: '65%', b: 'blur-xl', op: 'opacity-70', r: 40, d: 4 },
  { Icon: Box, size: 35, x: '55%', y: '60%', b: 'blur-sm', op: 'opacity-100', r: -15, d: 2.4 },
  { Icon: BookCopy, size: 55, x: '92%', y: '30%', b: 'blur-md', op: 'opacity-90', r: 22, d: 1.6 },
  { Icon: PenTool, size: 65, x: '12%', y: '65%', b: 'blur-md', op: 'opacity-90', r: -35, d: 3 },
  { Icon: GraduationCap, size: 40, x: '40%', y: '15%', b: 'blur-sm', op: 'opacity-100', r: 12, d: 0.2 },
  { Icon: Layout, size: 75, x: '60%', y: '75%', b: 'blur-lg', op: 'opacity-90', r: -18, d: 2 },
  
  // Outer Edges Coverage
  { Icon: Server, size: 140, x: '10%', y: '5%', b: 'blur-xl', op: 'opacity-70', r: -14, d: 4.5 },
  { Icon: Book, size: 25, x: '78%', y: '65%', b: 'blur-none', op: 'opacity-100', r: 33, d: 1 },
  { Icon: Box, size: 85, x: '45%', y: '85%', b: 'blur-lg', op: 'opacity-90', r: -5, d: 3.2 },
  { Icon: PenTool, size: 35, x: '18%', y: '45%', b: 'blur-sm', op: 'opacity-100', r: -40, d: 0.6 },
  { Icon: FileText, size: 90, x: '68%', y: '10%', b: 'blur-xl', op: 'opacity-70', r: 25, d: 2.8 },
  { Icon: Code, size: 45, x: '95%', y: '80%', b: 'blur-md', op: 'opacity-90', r: -28, d: 1.5 },
  { Icon: Monitor, size: 30, x: '52%', y: '35%', b: 'blur-sm', op: 'opacity-100', r: -8, d: 3 },
  { Icon: Globe, size: 70, x: '82%', y: '55%', b: 'blur-lg', op: 'opacity-90', r: 45, d: 0.4 },
  { Icon: BookOpen, size: 100, x: '20%', y: '90%', b: 'blur-xl', op: 'opacity-70', r: -22, d: 2.2 },
  { Icon: BookCopy, size: 40, x: '5%', y: '35%', b: 'blur-sm', op: 'opacity-100', r: 12, d: 4 },
  { Icon: Layout, size: 45, x: '40%', y: '95%', b: 'blur-sm', op: 'opacity-100', r: 5, d: 1.2 },
  { Icon: Server, size: 80, x: '88%', y: '20%', b: 'blur-lg', op: 'opacity-90', r: -15, d: 3.6 },
  
  // Gap Fillers Phase 1
  { Icon: BookOpen, size: 65, x: '3%', y: '22%', b: 'blur-md', op: 'opacity-90', r: 12, d: 2 },
  { Icon: FileText, size: 45, x: '97%', y: '18%', b: 'blur-sm', op: 'opacity-100', r: -18, d: 4 },
  { Icon: Monitor, size: 85, x: '28%', y: '12%', b: 'blur-lg', op: 'opacity-90', r: 25, d: 0.5 },
  { Icon: Globe, size: 30, x: '72%', y: '25%', b: 'blur-none', op: 'opacity-100', r: -42, d: 3 },
  { Icon: Server, size: 120, x: '45%', y: '95%', b: 'blur-xl', op: 'opacity-70', r: 8, d: 1 },

  // +50 Elements Map
  { Icon: Code, size: 45, x: '12%', y: '38%', b: 'blur-sm', op: 'opacity-100', r: 45, d: 0.3 },
  { Icon: Box, size: 65, x: '68%', y: '42%', b: 'blur-md', op: 'opacity-90', r: -12, d: 1.1 },
  { Icon: PenTool, size: 35, x: '58%', y: '22%', b: 'blur-none', op: 'opacity-100', r: 30, d: 2.4 },
  { Icon: BookCopy, size: 75, x: '85%', y: '35%', b: 'blur-lg', op: 'opacity-70', r: -22, d: 0.8 },
  { Icon: Layout, size: 50, x: '35%', y: '48%', b: 'blur-sm', op: 'opacity-100', r: 8, d: 1.7 },
  { Icon: Globe, size: 28, x: '92%', y: '15%', b: 'blur-none', op: 'opacity-100', r: -45, d: 3.2 },
  { Icon: Server, size: 95, x: '22%', y: '68%', b: 'blur-lg', op: 'opacity-70', r: 15, d: 2.1 },
  { Icon: FileText, size: 55, x: '48%', y: '18%', b: 'blur-md', op: 'opacity-90', r: -35, d: 0.6 },
  { Icon: Book, size: 40, x: '75%', y: '82%', b: 'blur-sm', op: 'opacity-100', r: 55, d: 4.1 },
  { Icon: Monitor, size: 110, x: '8%', y: '75%', b: 'blur-xl', op: 'opacity-70', r: -8, d: 1.4 },
  { Icon: GraduationCap, size: 30, x: '88%', y: '72%', b: 'blur-none', op: 'opacity-100', r: -20, d: 3.8 },
  { Icon: Code, size: 85, x: '55%', y: '45%', b: 'blur-lg', op: 'opacity-70', r: 25, d: 0.9 },
  { Icon: Box, size: 45, x: '32%', y: '28%', b: 'blur-sm', op: 'opacity-100', r: -18, d: 2.6 },
  { Icon: PenTool, size: 60, x: '62%', y: '88%', b: 'blur-md', op: 'opacity-90', r: 42, d: 1.3 },
  { Icon: Layout, size: 35, x: '18%', y: '58%', b: 'blur-none', op: 'opacity-100', r: -30, d: 3.4 },
  
  // Layer 4 (Deep fill)
  { Icon: BookCopy, size: 50, x: '15%', y: '25%', b: 'blur-sm', op: 'opacity-100', r: -15, d: 0.2 },
  { Icon: Server, size: 70, x: '80%', y: '25%', b: 'blur-md', op: 'opacity-90', r: 18, d: 2.9 },
  { Icon: BookOpen, size: 95, x: '42%', y: '78%', b: 'blur-lg', op: 'opacity-70', r: -8, d: 1.2 },
  { Icon: Globe, size: 40, x: '52%', y: '12%', b: 'blur-sm', op: 'opacity-100', r: 35, d: 3.7 },
  { Icon: FileText, size: 30, x: '5%', y: '8%', b: 'blur-none', op: 'opacity-100', r: -25, d: 4.5 },
  { Icon: Monitor, size: 75, x: '95%', y: '95%', b: 'blur-md', op: 'opacity-90', r: -12, d: 0.7 },
  { Icon: Code, size: 55, x: '28%', y: '92%', b: 'blur-sm', op: 'opacity-100', r: 22, d: 2.3 },
  { Icon: GraduationCap, size: 85, x: '68%', y: '55%', b: 'blur-lg', op: 'opacity-70', r: -40, d: 1.8 },
  { Icon: Box, size: 100, x: '32%', y: '5%', b: 'blur-xl', op: 'opacity-70', r: 30, d: 0.4 },
  { Icon: PenTool, size: 25, x: '45%', y: '35%', b: 'blur-none', op: 'opacity-100', r: -18, d: 3.1 },

  // Layer 5 (Cluster Edge Saturation)
  { Icon: Book, size: 65, x: '2%', y: '32%', b: 'blur-md', op: 'opacity-90', r: 12, d: 1.9 },
  { Icon: Code, size: 48, x: '98%', y: '48%', b: 'blur-sm', op: 'opacity-100', r: -22, d: 0.6 },
  { Icon: Server, size: 35, x: '18%', y: '98%', b: 'blur-none', op: 'opacity-100', r: 45, d: 4.2 },
  { Icon: Layout, size: 80, x: '82%', y: '2%', b: 'blur-lg', op: 'opacity-70', r: -10, d: 2.7 },
  { Icon: BookCopy, size: 55, x: '58%', y: '72%', b: 'blur-sm', op: 'opacity-100', r: 28, d: 1.1 },
  { Icon: Globe, size: 110, x: '45%', y: '45%', b: 'blur-xl', op: 'opacity-70', r: -5, d: 3.4 },
  { Icon: Box, size: 40, x: '8%', y: '62%', b: 'blur-sm', op: 'opacity-100', r: -35, d: 0.8 },
  { Icon: Monitor, size: 70, x: '72%', y: '88%', b: 'blur-md', op: 'opacity-90', r: 18, d: 2.5 },
  { Icon: BookOpen, size: 30, x: '88%', y: '50%', b: 'blur-none', op: 'opacity-100', r: -15, d: 4.0 },
  { Icon: FileText, size: 65, x: '38%', y: '22%', b: 'blur-md', op: 'opacity-90', r: 32, d: 1.3 },

  // Layer 6 (Macro Additions)
  { Icon: GraduationCap, size: 50, x: '22%', y: '18%', b: 'blur-sm', op: 'opacity-100', r: -28, d: 0.4 },
  { Icon: Code, size: 90, x: '62%', y: '12%', b: 'blur-lg', op: 'opacity-70', r: 14, d: 3.6 },
  { Icon: PenTool, size: 45, x: '85%', y: '95%', b: 'blur-sm', op: 'opacity-100', r: -42, d: 1.7 },
  { Icon: Server, size: 120, x: '5%', y: '95%', b: 'blur-xl', op: 'opacity-70', r: 25, d: 2.8 },
  { Icon: Layout, size: 35, x: '42%', y: '5%', b: 'blur-none', op: 'opacity-100', r: -12, d: 4.3 },
  { Icon: Globe, size: 60, x: '55%', y: '35%', b: 'blur-md', op: 'opacity-90', r: 40, d: 0.9 },
  { Icon: Box, size: 85, x: '15%', y: '45%', b: 'blur-lg', op: 'opacity-70', r: -18, d: 2.2 },
  { Icon: BookCopy, size: 40, x: '78%', y: '52%', b: 'blur-sm', op: 'opacity-100', r: 35, d: 1.5 },
  { Icon: FileText, size: 50, x: '32%', y: '85%', b: 'blur-md', op: 'opacity-90', r: -22, d: 3.9 },
  { Icon: Monitor, size: 28, x: '92%', y: '85%', b: 'blur-none', op: 'opacity-100', r: 10, d: 0.2 },
  
  // Layer X (Chaotic Fillers)
  { Icon: BookOpen, size: 45, x: '48%', y: '58%', b: 'blur-sm', op: 'opacity-100', r: -35, d: 3.3 },
  { Icon: GraduationCap, size: 75, x: '95%', y: '25%', b: 'blur-md', op: 'opacity-90', r: 28, d: 1.6 },
  { Icon: PenTool, size: 32, x: '25%', y: '98%', b: 'blur-none', op: 'opacity-100', r: -5, d: 4.1 },
  { Icon: Server, size: 65, x: '5%', y: '25%', b: 'blur-md', op: 'opacity-90', r: 18, d: 0.7 },
  { Icon: Box, size: 55, x: '82%', y: '78%', b: 'blur-sm', op: 'opacity-100', r: -40, d: 2.4 },
  { Icon: Layout, size: 100, x: '65%', y: '95%', b: 'blur-lg', op: 'opacity-70', r: 22, d: 1.9 },
  { Icon: Globe, size: 38, x: '38%', y: '38%', b: 'blur-sm', op: 'opacity-100', r: -15, d: 4.4 },
  { Icon: Code, size: 25, x: '75%', y: '8%', b: 'blur-none', op: 'opacity-100', r: 30, d: 0.5 },
  { Icon: Monitor, size: 85, x: '52%', y: '82%', b: 'blur-md', op: 'opacity-90', r: -25, d: 3.1 },
  { Icon: Book, size: 45, x: '18%', y: '82%', b: 'blur-sm', op: 'opacity-100', r: 12, d: 1.2 },

  // Overdrive Set A
  { Icon: Code, size: 55, x: '10%', y: '28%', b: 'blur-none', op: 'opacity-100', r: -55, d: 0.6 },
  { Icon: Server, size: 85, x: '30%', y: '15%', b: 'blur-md', op: 'opacity-90', r: 35, d: 2.8 },
  { Icon: BookOpen, size: 38, x: '55%', y: '8%', b: 'blur-sm', op: 'opacity-100', r: 12, d: 1.4 },
  { Icon: Box, size: 70, x: '88%', y: '38%', b: 'blur-lg', op: 'opacity-70', r: -22, d: 3.2 },
  { Icon: Monitor, size: 45, x: '68%', y: '58%', b: 'blur-none', op: 'opacity-100', r: 42, d: 0.9 },
  { Icon: PenTool, size: 95, x: '20%', y: '50%', b: 'blur-lg', op: 'opacity-70', r: -15, d: 2.1 },
  { Icon: Layout, size: 30, x: '82%', y: '98%', b: 'blur-sm', op: 'opacity-100', r: 28, d: 4.5 },
  { Icon: Globe, size: 65, x: '42%', y: '32%', b: 'blur-md', op: 'opacity-90', r: -8, d: 0.4 },
  { Icon: BookCopy, size: 110, x: '98%', y: '12%', b: 'blur-xl', op: 'opacity-70', r: 50, d: 3.7 },
  { Icon: FileText, size: 25, x: '12%', y: '92%', b: 'blur-none', op: 'opacity-100', r: -38, d: 1.8 },
  



];

const AnimatedBackground = memo(() => {
  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-ink-500/5 via-transparent to-transparent pointer-events-none" />
      <motion.div 
        animate={{ opacity: [0.3, 0.4, 0.3], scale: [1, 1.05, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[10%] left-[20%] w-[800px] h-[800px] bg-ink-500/5 rounded-full blur-[140px] pointer-events-none transform-gpu" 
      />
      <motion.div 
        animate={{ opacity: [0.2, 0.35, 0.2], scale: [1, 1.1, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[-10%] right-[-10%] w-[900px] h-[900px] bg-panel rounded-full blur-[160px] pointer-events-none transform-gpu" 
      />

      <div className="absolute inset-0 z-0 opacity-100 pointer-events-none">
        {BACKGROUND_ELEMENTS.map((item, i) => (
          <motion.div
            key={i}
            className={`absolute ${item.b} ${item.op} text-text-main/5 pointer-events-none transform-gpu will-change-transform`}
            style={{ left: item.x, top: item.y }}
            initial={{ rotate: item.r }}
            animate={{ 
              y: [0, -90, 0],
              x: [0, (i % 2 === 0 ? 25 : -25), 0],
              rotate: [item.r, item.r + 30, item.r - 15, item.r]
            }}
            transition={{ 
              duration: 15 + (i * 0.4), 
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
