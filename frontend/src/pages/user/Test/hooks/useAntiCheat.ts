import { useEffect, useState, useCallback } from 'react';

export const useAntiCheat = (onViolation: (type: string) => void) => {
  const [violations, setViolations] = useState<string[]>([]);
  const [isAntiCheatActive, setIsAntiCheatActive] = useState(false);

  const handleVisibilityChange = useCallback(() => {
    if (document.hidden && isAntiCheatActive) {
      setViolations(prev => [...prev, 'tab_switch']);
      onViolation('tab_switch');
    }
  }, [isAntiCheatActive, onViolation]);

  const handleContextMenu = useCallback((e: MouseEvent) => {
    if (isAntiCheatActive) {
      e.preventDefault();
      onViolation('right_click');
    }
  }, [isAntiCheatActive, onViolation]);

  const handleCopy = useCallback((e: ClipboardEvent) => {
    if (isAntiCheatActive) {
      e.preventDefault();
      onViolation('copy_paste');
    }
  }, [isAntiCheatActive, onViolation]);

  useEffect(() => {
    if (isAntiCheatActive) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      document.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('copy', handleCopy);
      
      // Attempt to enforce fullscreen if possible
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(err => {
          console.warn('Fullscreen request denied:', err);
        });
      }
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
    };
  }, [isAntiCheatActive, handleVisibilityChange, handleContextMenu, handleCopy]);

  const startAntiCheat = useCallback(() => setIsAntiCheatActive(true), []);
  const stopAntiCheat = useCallback(() => setIsAntiCheatActive(false), []);

  return {
    violations,
    startAntiCheat,
    stopAntiCheat
  };
};
