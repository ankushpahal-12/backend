import { AxiosError } from 'axios';
import api from '../../../../utils/api';


export const fetchAvailableTests = async () => {
  try {
    const { data } = await api.get('/v1/attempt/tests/available');
    return {
      success: true,
      data: data.data,
      count: data.count
    };
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as AxiosError<any>;
    return {
      success: false,
      error: err.response?.data?.message || err.message
    };
  }
};

/**
 * Get test by ID
 */
export const fetchTestById = async (testId: string) => {
  try {
    const { data } = await api.get(`/v1/attempt/tests/${testId}`);
    return {
      success: true,
      data: data.data
    };
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as AxiosError<any>;
    return {
      success: false,
      error: err.response?.data?.message || err.message
    };
  }
};

/**
 * Start a test attempt
 */
export const startTestAttempt = async (testId: string) => {
  try {
    // TODO: Update this to use share token when frontend share flow is built
    const { data } = await api.post(`/v1/attempt/tests/start/${testId}`);
    return {
      success: true,
      data: data.data
    };
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as AxiosError<any>;
    return {
      success: false,
      error: err.response?.data?.message || err.message
    };
  }
};

/**
 * Save an answer (auto-save during test)
 */
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
    });
    return {
      success: true,
      data: data.data
    };
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as AxiosError<any>;
    return {
      success: false,
      error: err.response?.data?.message || err.message
    };
  }
};

/**
 * Submit test
 */
export const submitTest = async (attemptId: string) => {
  try {
    const { data } = await api.post(`/v1/attempt/tests/${attemptId}/submit`);
    return {
      success: true,
      data: data.data
    };
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as AxiosError<any>;
    return {
      success: false,
      error: err.response?.data?.message || err.message
    };
  }
};

/**
 * Get test results
 */
export const fetchTestResults = async (attemptId: string) => {
  try {
    const { data } = await api.get(`/v1/attempt/tests/results/${attemptId}`);
    return {
      success: true,
      data: data.data
    };
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as AxiosError<any>;
    return {
      success: false,
      error: err.response?.data?.message || err.message
    };
  }
};

/**
 * Get user's test history
 */
export const fetchUserTestHistory = async (
  status?: string,
  limit: number = 10,
  page: number = 1
) => {
  try {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('limit', limit.toString());
    params.append('page', page.toString());

    const { data } = await api.get(`/v1/attempt/tests/history?${params.toString()}`);
    return {
      success: true,
      data: data.data,
      pagination: data.pagination
    };
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as AxiosError<any>;
    return {
      success: false,
      error: err.response?.data?.message || err.message
    };
  }
};

// ════════════════════════════════════════════════════════════════════
// ADMIN TEST APIs
// ════════════════════════════════════════════════════════════════════

/**
 * Create new test (Admin only)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createTest = async (testData: any) => {
  try {
    const { data } = await api.post('/v1/admin/tests', testData);
    return {
      success: true,
      data: data.data
    };
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as AxiosError<any>;
    return {
      success: false,
      error: err.response?.data?.message || err.message,
      errors: err.response?.data?.errors
    };
  }
};

/**
 * Update test (Admin only)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateTest = async (testId: string, testData: any) => {
  try {
    const { data } = await api.put(`/v1/admin/tests/${testId}`, testData);
    return {
      success: true,
      data: data.data
    };
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as AxiosError<any>;
    return {
      success: false,
      error: err.response?.data?.message || err.message
    };
  }
};

/**
 * Delete test (Admin only)
 */
export const deleteTest = async (testId: string) => {
  try {
    const { data } = await api.delete(`/v1/admin/tests/${testId}`);
    return {
      success: true,
      message: data.message
    };
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as AxiosError<any>;
    return {
      success: false,
      error: err.response?.data?.message || err.message
    };
  }
};

// ════════════════════════════════════════════════════════════════════
// MOCK DATA (for development/testing without backend)
// ════════════════════════════════════════════════════════════════════

/**
 * Get test details for Admin (includes users and attempts)
 */
export const fetchTestDetailsAdmin = async (testId: string) => {
  try {
    const { data } = await api.get(`/v1/admin/tests/${testId}`);
    return {
      success: true,
      data: data.data
    };
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as AxiosError<any>;
    return {
      success: false,
      error: err.response?.data?.message || err.message
    };
  }
};

/**
 * Update test attempt toggles (unseen, allowRetake, isMoreOptionOn)
 */
export const updateTestAttemptToggle = async (attemptId: string, toggles: any) => {
  try {
    const { data } = await api.put(`/v1/admin/tests/attempts/${attemptId}/toggle`, toggles);
    return {
      success: true,
      data: data.data
    };
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as AxiosError<any>;
    return {
      success: false,
      error: err.response?.data?.message || err.message
    };
  }
};

/**
 * Force submit a test attempt
 */
export const forceSubmitAttemptAdmin = async (attemptId: string) => {
  try {
    const { data } = await api.post(`/v1/admin/tests/attempts/${attemptId}/force-submit`);
    return {
      success: true,
      message: data.message,
      data: data.data
    };
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as AxiosError<any>;
    return {
      success: false,
      error: err.response?.data?.message || err.message
    };
  }
};
/**
 * Delete a test attempt (for retakes)
 */
export const deleteTestAttempt = async (attemptId: string) => {
  try {
    const { data } = await api.delete(`/v1/admin/tests/attempts/${attemptId}`);
    return {
      success: true,
      message: data.message
    };
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as AxiosError<any>;
    return {
      success: false,
      error: err.response?.data?.message || err.message
    };
  }
};

/**
 * Generate a share token for a test
 */
export const generateShareToken = async (testId: string) => {
  try {
    const { data } = await api.get(`/v1/admin/tests/${testId}/share`);
    return {
      success: true,
      data: data.data
    };
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as AxiosError<any>;
    return {
      success: false,
      error: err.response?.data?.message || err.message
    };
  }
};

/**
 * Grant retake for a test attempt (admin override for private tests)
 */
export const grantRetakeForAttempt = async (attemptId: string) => {
  try {
    const { data } = await api.post(`/v1/admin/tests/attempts/${attemptId}/grant-retake`);
    return {
      success: true,
      message: data.message,
      data: data.data
    };
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as AxiosError<any>;
    return {
      success: false,
      error: err.response?.data?.message || err.message
    };
  }
};
