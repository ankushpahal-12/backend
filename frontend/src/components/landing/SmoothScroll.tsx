import React, { useEffect, type ReactNode } from 'react';

interface SmoothScrollProps {
  children: ReactNode;
  speed?: number;
}

export const SmoothScroll: React.FC<SmoothScrollProps> = ({ children, speed = 1 }) => {
  useEffect(() => {
    // Add smooth scroll behavior to the document
    const html = document.documentElement;
    html.style.scrollBehavior = 'smooth';

    // Handle smooth scroll with parallax effect on scroll
    let ticking = false;
    let lastScrollY = 0;

    const updateScroll = () => {
      lastScrollY = window.scrollY;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('scroll', onScroll);
      html.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div className="smooth-scroll-wrapper" style={{ overscrollBehavior: 'none' }}>
      {children}
    </div>
  );
};

export default SmoothScroll;
