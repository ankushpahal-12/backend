import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import confusedImage from '../../assets/confused-image.jpg';
import examperpImage from '../../assets/examperp-image.jpg';
import analyticsImage from '../../assets/Analytics-image.jpg';
import resultImage from '../../assets/Result.jpg';

// Register GSAP ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export const HowItWorks = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Synchronize GSAP ScrollTrigger with Lenis smooth scrolling if active
    if ((window as any).lenis) {
      const lenisInstance = (window as any).lenis;
      lenisInstance.on('scroll', ScrollTrigger.update);
    }

    // Create GSAP context for proper automated DOM and ScrollTrigger cleanup on unmount
    const ctx = gsap.context(() => {
      // Set initial hidden yPercent translations via GSAP with hardware acceleration (force3D)
      gsap.set('.work-slide-2, .work-slide-3, .work-slide-4', { 
        yPercent: 100, 
        force3D: true 
      });

      // Universal ScrollTrigger Timeline - Highly optimized for zero latency
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=300%', // 300% of viewport height scroll distance
          scrub: true, // Direct tracking (eliminates the 1s delay conflict with Lenis's own smoothing)
          pin: true, // Pins the section inside the screen
          anticipatePin: 1,
          invalidateOnRefresh: true,
          pinType: 'fixed', // Force fixed viewport pinning since Lenis uses native window scrolling (not transform wrappers)
        },
      });

      // Animate Image 2 sliding up from the bottom with GPU layers (force3D)
      tl.fromTo(
        '.work-slide-2',
        { yPercent: 100 },
        { yPercent: 0, ease: 'none', duration: 1, force3D: true }
      )
      // Animate Image 3 sliding up to cover Image 2 with GPU layers (force3D)
      .fromTo(
        '.work-slide-3',
        { yPercent: 100 },
        { yPercent: 0, ease: 'none', duration: 1, force3D: true }
      )
      // Animate Image 4 sliding up to cover Image 3 with GPU layers (force3D)
      .fromTo(
        '.work-slide-4',
        { yPercent: 100 },
        { yPercent: 0, ease: 'none', duration: 1, force3D: true }
      );
    }, containerRef);

    // Refresh ScrollTrigger to calculate correct layout offsets
    ScrollTrigger.refresh();

    // Clean up context and triggers safely on unmount
    return () => {
      if ((window as any).lenis) {
        const lenisInstance = (window as any).lenis;
        lenisInstance.off('scroll', ScrollTrigger.update);
      }
      ctx.revert(); // Safely reverts GSAP context and kills all active triggers and removes pin spacers to avoid DOM unmount crashes
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden bg-[#000000] border-t border-b border-white/5"
      id="how-it-works"
    >
      {/* Pinned Viewport Frame - Uses [100dvh] (Dynamic Viewport Height) to prevent mobile address bar resizing / flickering */}
      <div className="relative w-full h-[100dvh] overflow-hidden bg-[#000000]">
        
        {/* Full-window absolute stacked images canvas - Spans 100% width and height */}
        <div className="relative w-full h-full overflow-hidden select-none pointer-events-none z-10">
          
          {/* SLIDE 1: Confused Student (Static Base Layer) */}
          <div className="work-slide-1 absolute inset-0 w-full h-full z-10 overflow-hidden will-change-transform">
            <img
              src={confusedImage}
              alt="Confused Student"
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover select-none pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#000000]/10 via-transparent to-[#000000]/30 pointer-events-none" />
          </div>

          {/* SLIDE 2: Online Practice Test */}
          <div className="work-slide-2 absolute inset-0 w-full h-full z-20 overflow-hidden shadow-[0_-30px_70px_rgba(0,0,0,0.85)] border-t border-white/5 will-change-transform">
            <img
              src={examperpImage}
              alt="Online Practice Test"
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover select-none pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#000000]/10 via-transparent to-[#000000]/30 pointer-events-none" />
          </div>

          {/* SLIDE 3: AI Analytics Overlay */}
          <div className="work-slide-3 absolute inset-0 w-full h-full z-30 overflow-hidden shadow-[0_-30px_70px_rgba(0,0,0,0.85)] border-t border-white/5 will-change-transform">
            <img
              src={analyticsImage}
              alt="AI Analytics Overlay"
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover select-none pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#000000]/10 via-transparent to-[#000000]/30 pointer-events-none" />
          </div>

          {/* SLIDE 4: Result + Happy Student */}
          <div className="work-slide-4 absolute inset-0 w-full h-full z-40 overflow-hidden shadow-[0_-30px_70px_rgba(0,0,0,0.85)] border-t border-white/5 will-change-transform">
            <img
              src={resultImage}
              alt="Result + Happy Student"
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover select-none pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#000000]/10 via-transparent to-[#000000]/30 pointer-events-none" />
          </div>

        </div>

      </div>
    </section>
  );
};

export default HowItWorks;