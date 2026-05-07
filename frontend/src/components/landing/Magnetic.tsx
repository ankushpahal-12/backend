import React, { useRef, useEffect, type ReactNode } from 'react';

interface MagneticProps {
  children: ReactNode;
  strength?: number;
  className?: string;
}

export const Magnetic: React.FC<MagneticProps> = ({ children, strength = 0.5, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const elementCenterX = rect.left + rect.width / 2;
      const elementCenterY = rect.top + rect.height / 2;

      mouseX = e.clientX;
      mouseY = e.clientY;

      const distanceX = mouseX - elementCenterX;
      const distanceY = mouseY - elementCenterY;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

      // Apply magnetic effect only within a certain range
      const maxDistance = 100;
      if (distance < maxDistance) {
        const force = (1 - distance / maxDistance) * strength;
        const angle = Math.atan2(distanceY, distanceX);

        const translateX = Math.cos(angle) * force * 20;
        const translateY = Math.sin(angle) * force * 20;

        element.style.transform = `translate(${translateX}px, ${translateY}px)`;
      } else {
        element.style.transform = 'translate(0, 0)';
      }
    };

    const handleMouseLeave = () => {
      element.style.transform = 'translate(0, 0)';
    };

    window.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength]);

  return (
    <div
      ref={ref}
      className={`transition-transform duration-75 ${className}`}
      style={{ cursor: 'pointer' }}
    >
      {children}
    </div>
  );
};

export default Magnetic;
