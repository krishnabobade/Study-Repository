import React from 'react';
import { motion } from 'framer-motion';

const SkeletonBase = ({ className = '', style = {} }) => (
  <div 
    className={`shimmer-bg rounded-xl ${className}`} 
    style={style}
  />
);

export const SkeletonText = ({ lines = 1, className = '', lastLineWidth = '70%' }) => (
  <div className={`space-y-2.5 ${className}`}>
    {[...Array(lines)].map((_, i) => (
      <SkeletonBase 
        key={i} 
        className="h-2.5 w-full opacity-60" 
        style={i === lines - 1 && lines > 1 ? { width: lastLineWidth } : {}}
      />
    ))}
  </div>
);

export const SkeletonTitle = ({ className = '', width = '60%' }) => (
  <SkeletonBase className={`h-7 ${className}`} style={{ width }} />
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
  <SkeletonBase className={`h-11 rounded-xl ${className}`} style={{ width }} />
);

export const SkeletonInput = ({ className = '' }) => (
  <SkeletonBase className={`h-12 w-full rounded-xl ${className}`} />
);

export const SkeletonCard = ({ className = '' }) => (
  <div className="card p-5 space-y-4">
    <SkeletonImage ratio="16/9" className="rounded-xl" />
    <div className="space-y-3">
      <SkeletonTitle width="80%" />
      <SkeletonText lines={2} />
      <div className="flex justify-between items-center pt-2">
        <SkeletonAvatar size={32} />
        <SkeletonButton width="80px" className="h-8" />
      </div>
    </div>
  </div>
);

export const SkeletonResourceCard = () => (
  <div className="card p-4 space-y-4">
    <div className="flex items-start gap-3">
      <SkeletonBase className="w-10 h-10 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex justify-between items-center">
          <SkeletonBase className="h-4 w-1/3" />
          <SkeletonBase className="h-4 w-12 rounded-full" />
        </div>
        <div className="flex gap-2">
          <SkeletonBase className="h-3 w-16 rounded-full" />
          <SkeletonBase className="h-3 w-12 rounded-full" />
        </div>
        <div className="flex justify-between items-center pt-2">
          <SkeletonBase className="h-3 w-20" />
          <div className="flex gap-2">
             <SkeletonBase className="h-3 w-6" />
             <SkeletonBase className="h-3 w-6" />
          </div>
        </div>
      </div>
    </div>
    <SkeletonButton className="w-full h-9" />
  </div>
);

export const SkeletonTable = ({ rows = 5, cols = 4, className = '' }) => (
  <div className={`bg-panel border border-border rounded-2xl overflow-hidden ${className}`}>
    <div className="bg-surface/30 border-b border-border p-4 flex gap-4">
      {[...Array(cols)].map((_, i) => (
        <SkeletonBase key={i} className="h-4 flex-1 opacity-40" />
      ))}
    </div>
    <div className="divide-y divide-border">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="p-4 flex gap-4 items-center">
          {[...Array(cols)].map((_, j) => (
            <SkeletonBase key={j} className="h-4 flex-1 opacity-60" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonList = ({ items = 3, className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    {[...Array(items)].map((_, i) => (
      <div key={i} className="card p-4 flex items-center gap-4">
        <SkeletonBase className="h-12 w-12 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonBase className="h-4 w-1/4" />
          <SkeletonBase className="h-3 w-1/2" />
        </div>
        <SkeletonButton width="60px" className="h-8" />
      </div>
    ))}
  </div>
);

export default SkeletonBase;

