import api from '../../../../utils/api';
import { AxiosError } from 'axios';
import type { CandidateTest, Attempt, AttemptResult } from '../types/attempt.types';

const generateSessionId = () => {
  let sessionId = sessionStorage.getItem('attemptSessionId');
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('attemptSessionId', sessionId);
  }
  return sessionId;
};

export const getHeaders = () => ({
  'x-session-id': generateSessionId()
});

export const fetchAvailableTests = async () => {
  try {
    const { data } = await api.get('/v1/attempt/tests/available');
    return { success: true, data: data.data as PublicTest[] };
  } catch (error: unknown) {
    const err = error as AxiosError<{message?: string}>;
    return { success: false, error: err.response?.data?.message || err.message };
  }
};

export const previewTest = async (token: string): Promise<{ success: boolean; data?: Record<string, unknown> | null; status?: number; isBlocked?: boolean; error?: string }> => {
  try {
    const { data } = await api.get(`/v1/attempt/tests/preview/${token}`);
    return { 
      success: true, 
      data: data.data as Record<string, unknown>
    };
  } catch (error: unknown) {
    const err = error as AxiosError<{message?: string; isBlocked?: boolean}>;
    return { 
      success: false, 
      status: err.response?.status,
      isBlocked: err.response?.data?.isBlocked || false,
      error: err.response?.data?.message || err.message 
    };
  }
};

export const startAttempt = async (token: string, email?: string): Promise<{
  success: boolean;
  data?: {
    test: CandidateTest;
    attempt: Attempt;
  };
  error?: string;
  retakesExhausted?: boolean;
  canContactAdmin?: boolean;
}> => {
  try {
    const body = email ? { email } : {};
    console.log('🚀 startAttempt called with:', { token: token.slice(0, 20) + '...', email, body });
    const { data } = await api.post(`/v1/attempt/tests/start/${token}`, body, { headers: getHeaders() });
    return { 
      success: true, 
      data: {
        test: data.data.test as CandidateTest,
        attempt: data.data.attempt as Attempt
      }
    };
  } catch (error: unknown) {
    const err = error as AxiosError<{message?: string; retakesExhausted?: boolean; canContactAdmin?: boolean}>;
    console.error('❌ startAttempt error:', err.response?.data?.message || err.message);
    return { 
      success: false, 
      error: err.response?.data?.message || err.message,
      retakesExhausted: err.response?.data?.retakesExhausted || false,
      canContactAdmin: err.response?.data?.canContactAdmin || false
    };
  }
};

export const saveAnswer = async (
  attemptId: string,
  questionId: string,
  selectedOptions: string[],
  timeTaken: number
) => {
  try {
    const { data } = await api.post(`/v1/attempt/tests/${attemptId}/save-answer`, {
      questionId,
      selectedOptions,
      timeTaken
    }, { headers: getHeaders() });
    return { success: true, data: data.data };
  } catch (error: unknown) {
    const err = error as AxiosError<{message?: string}>;
    return { success: false, error: err.response?.data?.message || err.message };
  }
};

export const submitAttempt = async (attemptId: string) => {
  try {
    const { data } = await api.post(`/v1/attempt/tests/${attemptId}/submit`, {}, { headers: getHeaders() });
    return { success: true, data: data.data as AttemptResult };
  } catch (error: unknown) {
    const err = error as AxiosError<{message?: string}>;
    return { success: false, error: err.response?.data?.message || err.message };
  }
};

export const getAttemptResult = async (attemptId: string) => {
  try {
    const { data } = await api.get(`/v1/attempt/tests/results/${attemptId}`, { headers: getHeaders() });
    return { success: true, data: data.data as AttemptResult };
  } catch (error: unknown) {
    const err = error as AxiosError<{message?: string}>;
    return { success: false, error: err.response?.data?.message || err.message };
  }
};
