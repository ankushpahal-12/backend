import { useState, useEffect, useCallback } from 'react';
import * as testApiService from '../services/testApi';
import toast from 'react-hot-toast';

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  marks: number;
  allowMultiple: boolean;
  options: QuestionOption[];
  correctAnswers: string[];
}

export interface TestSettings {
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  showResultsImmediately?: boolean;
  allowReview?: boolean;
  showCorrectAnswers?: boolean;
  oneQuestionPerPage?: boolean;
}

export interface Test {
  id: string;
  title: string;
  description?: string;
  category: string;
  durationMinutes: number;
  totalMarks: number;
  questions: Question[];
  instructions?: string;
  settings?: TestSettings;
  status: 'draft' | 'published' | 'archived';
  createdAt?: string;
  updatedAt?: string;
}

export interface Answer {
  questionId: string;
  selectedOptions: string[];
  timeTaken: number;
}

export interface TestAttempt {
  _id: string;
  testId: string;
  userId: string;
  answers: Answer[];
  startedAt: string;
  submittedAt?: string;
  status: 'in-progress' | 'submitted' | 'graded';
  totalMarksObtained?: number;
  percentage?: number;
}

export interface TestResults {
  attemptId: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  status: string;
  submittedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export const useTests = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTests = useCallback(async () => {
    setLoading(true);
    try {
      const result = await testApiService.fetchAvailableTests();
      if (result.success) {
        setTests(result.data || []);
        setError(null);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch tests';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const createTest = async (testData: Partial<Test>) => {
    setLoading(true);
    try {
      const result = await testApiService.createTest(testData);
      if (result.success) {
        setTests(prev => [...prev, result.data]);
        toast.success('Test created successfully');
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create test';
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTest = async (id: string, testData: Partial<Test>) => {
    setLoading(true);
    try {
      const result = await testApiService.updateTest(id, testData);
      if (result.success) {
        setTests(prev => prev.map(t => t.id === id ? result.data : t));
        toast.success('Test updated successfully');
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update test';
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTest = async (id: string) => {
    setLoading(true);
    try {
      const result = await testApiService.deleteTest(id);
      if (result.success) {
        setTests(prev => prev.filter(t => t.id !== id));
        toast.success('Test deleted successfully');
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete test';
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const generateShareToken = async (id: string) => {
    setLoading(true);
    try {
      const result = await testApiService.generateShareToken(id);
      if (result.success) {
        return result.data.shareToken;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate share token';
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    tests,
    loading,
    error,
    fetchTests,
    createTest,
    updateTest,
    deleteTest,
    generateShareToken
  };
};

export const useTestAttempt = () => {
  const [attempt, setAttempt] = useState<TestAttempt | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<TestResults | null>(null);

  const startAttempt = useCallback(async (testId: string) => {
    setLoading(true);
    try {
      const result = await testApiService.startTestAttempt(testId);
      if (result.success) {
        setAttempt(result.data);
        setError(null);
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to start test';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveAnswer = useCallback(async (
    attemptId: string,
    questionId: string,
    selectedOptions: string[],
    timeTaken: number
  ) => {
    try {
      const result = await testApiService.saveAnswer(
        attemptId,
        questionId,
        selectedOptions,
        timeTaken
      );
      if (result.success) {
        setAttempt(result.data);
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Failed to save answer:', err);
      throw err;
    }
  }, []);

  const submitAttempt = useCallback(async (attemptId: string) => {
    setLoading(true);
    try {
      const result = await testApiService.submitTest(attemptId);
      if (result.success) {
        setResults(result.data);
        setAttempt(null);
        toast.success('Test submitted successfully');
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to submit test';
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getResults = useCallback(async (attemptId: string) => {
    try {
      const result = await testApiService.fetchTestResults(attemptId);
      if (result.success) {
        setResults(result.data);
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Failed to fetch results:', err);
      throw err;
    }
  }, []);

  return {
    attempt,
    loading,
    error,
    results,
    startAttempt,
    saveAnswer,
    submitAttempt,
    getResults
  };
};

export const useTestHistory = () => {
  const [history, setHistory] = useState<TestAttempt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const fetchHistory = useCallback(async (status?: string, limit = 10, page = 1) => {
    setLoading(true);
    try {
      const result = await testApiService.fetchUserTestHistory(status, limit, page);
      if (result.success) {
        setHistory(result.data || []);
        setPagination(result.pagination);
        setError(null);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch history';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    history,
    loading,
    error,
    pagination,
    fetchHistory
  };
};
