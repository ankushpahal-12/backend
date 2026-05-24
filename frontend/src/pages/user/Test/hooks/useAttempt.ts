import { useState, useCallback } from 'react';
import { useAttemptStore } from '../store/attemptStore';
import * as attemptApi from '../services/attemptApi';
import toast from 'react-hot-toast';

export const useAttempt = () => {
  const store = useAttemptStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const startAttempt = useCallback(async (token: string, email?: string) => {
    setLoading(true);
    try {
      const result = await attemptApi.startAttempt(token, email);
      if (result.success && result.data) {
        useAttemptStore.getState().setTestAndAttempt(result.data.test, result.data.attempt);
        setError(null);
        return true;
      } else {
        // Check for specific error types
        const errorMsg = result.error || 'Failed to start test';
        
        // Retake restriction errors
        if (result.retakesExhausted) {
          toast.error('You have used all available attempts for this test. Please contact the administrator if you need another chance.', { duration: 5000 });
        } else if (result.canContactAdmin) {
          toast.error('You have already completed this test once. Contact the administrator if you need another chance.', { duration: 5000 });
        } else if (errorMsg.includes('not yet available') || errorMsg.includes('time is over')) {
          toast.error(errorMsg, { duration: 5000 }); // Show longer for time errors
        } else {
          toast.error(errorMsg);
        }
        throw new Error(errorMsg);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to start test';
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveAnswer = useCallback(async (questionId: string, selectedOptions: string[], timeTaken: number) => {
    const currentState = useAttemptStore.getState();
    if (!currentState.attempt?._id) return;
    
    // Optimistic UI update
    currentState.updateAnswer(questionId, selectedOptions, timeTaken);
    
    // Background save
    const result = await attemptApi.saveAnswer(currentState.attempt._id, questionId, selectedOptions, timeTaken);
    if (!result.success) {
      if (result.error?.toLowerCase().includes('not found') || result.error?.toLowerCase().includes('404')) {
        toast.error('Your session is no longer valid (it may have been reset by an admin). Please refresh the page.');
      } else {
        console.error('Autosave failed:', result.error);
      }
    }
  }, []);

  const submitTest = useCallback(async () => {
    const currentState = useAttemptStore.getState();
    if (!currentState.attempt?._id) return false;
    
    setLoading(true);
    try {
      const result = await attemptApi.submitAttempt(currentState.attempt._id);
      if (result.success && result.data) {
        currentState.setResult(result.data);
        return true;
      } else {
        throw new Error(result.error);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit test';
      toast.error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleReviewFlag = useCallback((questionId: string) => {
    useAttemptStore.getState().toggleReviewFlag(questionId);
  }, []);

  const markVisited = useCallback((questionId: string) => {
    useAttemptStore.getState().markVisited(questionId);
  }, []);

  return {
    ...store,
    loading,
    error,
    startAttempt,
    saveAnswer,
    submitTest,
    toggleReviewFlag,
    markVisited
  };
};
