import React from 'react';
import { motion } from 'framer-motion';

const SkeletonBase = ({ className = '', style = {} }) => (
  <div 
    className={`shimmer-bg rounded-xl ${className}`} 
    style={style}
  />
);

export const SkeletonText = ({ lines = 1, className = '', lastLineWidth = '70%' }) => (
  <div className={`space-y-2 ${className}`}>
    {[...Array(lines)].map((_, i) => (
      <SkeletonBase 
        key={i} 
        className="h-3 w-full" 
        style={i === lines - 1 && lines > 1 ? { width: lastLineWidth } : {}}
      />
    ))}
  </div>
);

export const SkeletonTitle = ({ className = '', width = '60%' }) => (
  <SkeletonBase className={`h-8 ${className}`} style={{ width }} />
);

export const SkeletonAvatar = ({ size = 40, className = '' }) => (
  <SkeletonBase 
    className={`rounded-full ${className}`} 
    style={{ width: size, height: size }} 
  />
);

export const SkeletonImage = ({ ratio = '16/9', className = '' }) => (
  <div 
    className={`shimmer-bg rounded-2xl overflow-hidden ${className}`}
    style={{ aspectRatio: ratio }}
  />
);

export const SkeletonButton = ({ className = '', width = '120px' }) => (
  <SkeletonBase className={`h-10 ${className}`} style={{ width }} />
);

export const SkeletonInput = ({ className = '' }) => (
  <SkeletonBase className={`h-12 w-full ${className}`} />
);

export const SkeletonCard = ({ className = '' }) => (
  <div className={`card p-5 space-y-4 ${className}`}>
    <SkeletonImage ratio="16/9" />
    <div className="space-y-3">
      <SkeletonTitle width="80%" />
      <SkeletonText lines={2} />
      <div className="flex justify-between items-center pt-2">
        <SkeletonAvatar size={32} />
        <SkeletonButton width="80px" />
      </div>
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5, cols = 4, className = '' }) => (
  <div className={`bg-panel border border-border rounded-2xl overflow-hidden ${className}`}>
    <div className="bg-surface/50 border-b border-border p-4 flex gap-4">
      {[...Array(cols)].map((_, i) => (
        <SkeletonBase key={i} className="h-4 flex-1" />
      ))}
    </div>
    <div className="divide-y divide-border">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="p-4 flex gap-4 items-center">
          {[...Array(cols)].map((_, j) => (
            <SkeletonBase key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonList = ({ items = 3, className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    {[...Array(items)].map((_, i) => (
      <div key={i} className="bg-panel border border-border rounded-2xl p-4 flex items-center gap-4">
        <SkeletonBase className="h-12 w-12 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonBase className="h-4 w-1/3" />
          <SkeletonBase className="h-3 w-1/2" />
        </div>
        <SkeletonButton width="60px" />
      </div>
    ))}
  </div>
);

export default SkeletonBase;
