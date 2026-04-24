import { Suspense, lazy, useEffect } from 'react'

const Spline = lazy(() => import('@splinetool/react-spline'))

export function InteractiveRobotSpline({ scene, className, style }) {
  useEffect(() => {
    // Inject strict CSS to hide Spline watermark elements forcefully
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      .spline-watermark-wrapper > *:not(canvas) {
        display: none !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
      spline-viewer::part(logo) {
        display: none !important;
      }
      a[href*="spline"] {
        display: none !important;
      }
    `;
    document.head.appendChild(styleEl);

    // Dynamic DOM-level watermark removal interval for safety
    const interval = setInterval(() => {
      document.querySelectorAll('a[href*="spline.design"]').forEach(el => el.remove());
      document.querySelectorAll('[alt*="Spline"]').forEach(el => el.remove());
      const logo = document.getElementById('logo');
      if (logo) logo.remove();
    }, 50);

    return () => {
      clearInterval(interval);
      styleEl.remove();
    };
  }, []);

  const handleLoad = (splineApp) => {
    // Array of likely names for the base platform / floor / cube
    const platformNames = [
      'Cube', 'Floor', 'Platform', 'Base', 'Plane', 'Ground', 'Pedestal', 'Surface', 'Base Cube', 'Platform Base'
    ];
    
    // Explicitly hide named objects
    platformNames.forEach(name => {
      const obj = splineApp.findObjectByName(name);
      if (obj) {
        obj.visible = false;
      }
    });

    // In some advanced scenes with multiple matching names or variations
    try {
      if (typeof splineApp.getObjects === 'function') {
        const allObjects = splineApp.getObjects();
        allObjects.forEach(obj => {
          if (obj.name && (obj.name.toLowerCase().includes('cube') || obj.name.toLowerCase().includes('platform') || obj.name.toLowerCase() === 'floor')) {
            // Avoid hiding robot body parts if they are named cube, but usually they are grouped/named specifically.
            // Only hide large base elements if we are sure, but let's hide all 'cube' named elements as requested (Removing the "cube surface on which the robot is currently placed").
            obj.visible = false;
          }
        });
      }
    } catch (e) {
      console.warn("Could not retrieve all objects", e);
    }
  };

  return (
    <Suspense fallback={
      <div style={{ width:'100%', height:'100%', display:'flex',
        alignItems:'center', justifyContent:'center', background:'transparent' }}>
        <svg style={{ width:20, height:20, color:'#fff', marginRight:8, animation:'spin 1s linear infinite' }}
          xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle style={{ opacity:.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path style={{ opacity:.75 }} fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l2-2.647z"/>
        </svg>
        <span style={{ color:'#fff', fontSize:14 }}>Loading 3D...</span>
      </div>
    }>
      <div className="spline-watermark-wrapper" style={{ width: '100%', height: '100%' }}>
        <Spline scene={scene} className={className} style={{...style, pointerEvents: 'auto'}} onLoad={handleLoad} />
      </div>
    </Suspense>
  )
}
