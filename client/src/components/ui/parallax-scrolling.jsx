import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import { Leaf } from 'lucide-react';

export function ParallaxComponent() {
  const parallaxRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const triggerElement = parallaxRef.current?.querySelector('[data-parallax-layers]');

    if (triggerElement) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerElement,
          start: "0% 0%",
          end: "100% 0%",
          scrub: 0
        }
      });

      const layers = [
        { layer: "1", yPercent: 40 },
        { layer: "2", yPercent: 30 },
        { layer: "3", yPercent: 15 },
        { layer: "4", yPercent: 5 }
      ];

      layers.forEach((layerObj, idx) => {
        tl.to(
          triggerElement.querySelectorAll(`[data-parallax-layer="${layerObj.layer}"]`),
          {
            yPercent: layerObj.yPercent,
            ease: "none"
          },
          idx === 0 ? undefined : "<"
        );
      });
    }

    const lenis = new Lenis();
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    return () => {
      // Clean up GSAP and ScrollTrigger instances
      ScrollTrigger.getAll().forEach(st => st.kill());
      gsap.killTweensOf(triggerElement);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="relative h-[200vh] bg-black overflow-hidden font-display" ref={parallaxRef}>
      <section className="sticky top-0 h-screen w-full overflow-hidden">
        <div className="relative w-full h-full">
          {/* Black line overflow equivalent via gradients */}
          <div className="absolute top-0 w-full h-24 bg-gradient-to-b from-black to-transparent z-20" />
          
          <div data-parallax-layers className="absolute inset-0 w-full h-[120%] flex items-center justify-center pointer-events-none -top-10">
            {/* Deep Background Image Layer */}
            <img 
              src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000&auto=format&fit=crop" 
              loading="eager" 
              data-parallax-layer="1" 
              alt="Stars" 
              className="absolute w-[120%] h-full object-cover opacity-20" 
            />
            {/* Midground Layer */}
            <img 
              src="https://images.unsplash.com/photo-1484504110495-939e9baca603?q=80&w=1500&auto=format&fit=crop" 
              loading="eager" 
              data-parallax-layer="2" 
              alt="Nebula" 
              className="absolute w-[100%] h-full mix-blend-screen opacity-10 object-cover" 
            />
            {/* Text Layer */}
            <div data-parallax-layer="3" className="absolute z-10 flex flex-col items-center">
              <h2 className="text-[12vw] md:text-9xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-neutral-400 to-neutral-800">
                Parallax
              </h2>
            </div>
            {/* Foreground elements */}
            <img 
              src="https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?q=80&w=1500&auto=format&fit=crop" 
              loading="eager" 
              data-parallax-layer="4" 
              alt="Asteroid" 
              className="absolute mix-blend-screen opacity-30 right-[-10vw] bottom-[-20vh] w-[80vw] object-contain rotate-12" 
            />
          </div>
          <div className="absolute bottom-0 w-full h-40 bg-gradient-to-t from-black via-black/80 to-transparent z-20 pointer-events-none"></div>
        </div>
      </section>

      {/* Content Section */}
      <section className="relative z-30 min-h-screen bg-black flex flex-col items-center justify-center text-center px-4">
        <Leaf className="w-24 h-24 text-white/10 mb-8" />
        <h3 className="text-3xl md:text-5xl font-bold text-white mb-6">GSAP x Lenis Integration</h3>
        <p className="text-white/40 max-w-lg mb-12">
          This component perfectly ports the Osmo Parallax effect into Shadcn-ready React structures, complete with Unsplash assets and Tailwind positioning. 
        </p>
        <div className="osmo-credits mt-10 p-4 rounded-xl border border-white/10 text-white/30 text-sm">
          <p>
            Resource originated by <a target="_blank" href="https://www.osmo.supply/" className="text-white hover:underline transition-all font-medium">Osmo</a>
          </p>
        </div>
      </section>
    </div>
  );
}
