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

    // Media Query listener to disable pinning on small mobile viewports for smooth scrolling
    let mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      // Set initial hidden yPercent translations via GSAP to prevent React inline-style conflicts on state re-renders
      gsap.set('.work-slide-2, .work-slide-3, .work-slide-4', { yPercent: 100 });

      // Desktop pinning and sliding transitions
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=300%', // 300% of viewport height scroll distance
          scrub: 1, // Smooth scrolling transition timing
          pin: true, // Pins the section inside the screen
          anticipatePin: 1,
          invalidateOnRefresh: true,
          pinType: containerRef.current?.closest('.smooth-scroll-wrapper') ? 'transform' : 'fixed', // Fallback for Lenis wrapper transforms
        },
      });

      // Animate Image 2 sliding up from the bottom (100% y) to cover Image 1 (0% y)
      tl.fromTo(
        '.work-slide-2',
        { yPercent: 100 },
        { yPercent: 0, ease: 'none', duration: 1 }
      )
      // Animate Image 3 sliding up to cover Image 2
      .fromTo(
        '.work-slide-3',
        { yPercent: 100 },
        { yPercent: 0, ease: 'none', duration: 1 }
      )
      // Animate Image 4 sliding up to cover Image 3
      .fromTo(
        '.work-slide-4',
        { yPercent: 100 },
        { yPercent: 0, ease: 'none', duration: 1 }
      );
    });

    mm.add("(max-width: 767px)", () => {
      // Mobile cleanup / fallback: Reset positions, no pinning, normal layout
      gsap.set('.work-slide-2, .work-slide-3, .work-slide-4', { yPercent: 0 });
    });

    // Refresh ScrollTrigger to calculate correct layout offsets
    ScrollTrigger.refresh();

    // Clean up context and triggers safely on unmount
    return () => {
      if ((window as any).lenis) {
        const lenisInstance = (window as any).lenis;
        lenisInstance.off('scroll', ScrollTrigger.update);
      }
      mm.revert();
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden bg-[#000000] border-t border-b border-white/5"
      id="how-it-works"
    >
      {/* Pinned Viewport Frame - Full-screen layout */}
      <div className="relative w-screen h-screen overflow-hidden bg-[#000000]">
        
        {/* Full-window absolute stacked images canvas - Spans 100% width and height */}
        <div className="relative w-full h-full overflow-hidden select-none pointer-events-none z-10">
          
          {/* SLIDE 1: Confused Student (Static Base Layer) */}
          <div className="work-slide-1 absolute inset-0 w-full h-full z-10 overflow-hidden">
            <img
              src={confusedImage}
              alt="Confused Student"
              className="w-full h-full object-cover select-none pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#000000]/10 via-transparent to-[#000000]/30 pointer-events-none" />
          </div>

          {/* SLIDE 2: Online Practice Test */}
          <div className="work-slide-2 absolute inset-0 w-full h-full z-20 overflow-hidden shadow-[0_-30px_70px_rgba(0,0,0,0.85)] border-t border-white/5">
            <img
              src={examperpImage}
              alt="Online Practice Test"
              className="w-full h-full object-cover select-none pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#000000]/10 via-transparent to-[#000000]/30 pointer-events-none" />
          </div>

          {/* SLIDE 3: AI Analytics Overlay */}
          <div className="work-slide-3 absolute inset-0 w-full h-full z-30 overflow-hidden shadow-[0_-30px_70px_rgba(0,0,0,0.85)] border-t border-white/5">
            <img
              src={analyticsImage}
              alt="AI Analytics Overlay"
              className="w-full h-full object-cover select-none pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#000000]/10 via-transparent to-[#000000]/30 pointer-events-none" />
          </div>

          {/* SLIDE 4: Result + Happy Student */}
          <div className="work-slide-4 absolute inset-0 w-full h-full z-40 overflow-hidden shadow-[0_-30px_70px_rgba(0,0,0,0.85)] border-t border-white/5">
            <img
              src={resultImage}
              alt="Result + Happy Student"
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