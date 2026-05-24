import { useState, useEffect, useCallback, useRef } from 'react';

export const useTimer = (initialSeconds: number, onTimeUp: () => void) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isWarning, setIsWarning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [prevInitialSeconds, setPrevInitialSeconds] = useState(initialSeconds);
  if (initialSeconds !== prevInitialSeconds) {
    setPrevInitialSeconds(initialSeconds);
    setTimeLeft(initialSeconds);
    setIsWarning(false);
  }
  // useEffect(() => {
  //   if (initialSeconds > 0) {
  //     setTimeLeft(initialSeconds);
  //   }
  // }, [initialSeconds]);

  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0; // Don't trigger if it was already 0
        }
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          onTimeUp();
          return 0;
        }
        if (prev === 120) { // 2 minutes warning
          setIsWarning(true);
        }
        return prev - 1;
      });
    }, 1000);
  }, [onTimeUp]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  return {
    timeLeft,
    isWarning,
    startTimer,
    stopTimer
  };
};
