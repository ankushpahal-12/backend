import { create } from 'zustand';
import * as testApiService from '../services/testApi';
import toast from 'react-hot-toast';

interface TestState {
  activeTest: any | null;
  questions: any[];
  loading: boolean;
  saving: boolean;
  error: string | null;

  // Test Management
  initializeTest: (testData?: any) => void;
  updateTestInfo: (updates: any) => Promise<void>;
  saveTest: () => Promise<any>;
  publishTest: () => Promise<void>;
  deleteTest: (testId: string) => Promise<void>;

  // Question Management
  addQuestion: (question?: any) => void;
  updateQuestion: (id: string, updates: any) => void;
  deleteQuestion: (id: string) => void;
  duplicateQuestion: (id: string) => void;
  reorderQuestions: (questions: any[]) => void;
  saveAllQuestions: () => Promise<void>;

  // State Management
  setError: (error: string | null) => void;
  clearTest: () => void;
  loadTest: (testId: string) => Promise<void>;
}

const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useTestStore = create<TestState>((set, get) => ({
  activeTest: null,
  questions: [],
  loading: false,
  saving: false,
  error: null,

  // Initialize new test or load existing
  initializeTest: (testData) => {
    const defaultTest = testData || {
      id: null,
      title: '',
      description: '',
      category: '',
      durationMinutes: 30,
      totalMarks: 0,
      instructions: '',
      status: 'draft',
      questions: [],
      settings: {
        shuffleQuestions: true,
        shuffleOptions: true,
        showResultsImmediately: false,
        allowReview: true,
        showCorrectAnswers: false,
        oneQuestionPerPage: false,
        negativeMarking: 0,
        passingMarks: 40
      }
    };
    set({
      activeTest: defaultTest,
      questions: defaultTest.questions || [],
      error: null
    });
  },

  // Update test info (title, description, etc.)
  updateTestInfo: async (updates) => {
    set({ saving: true });
    try {
      const { activeTest } = get();
      if (!activeTest) throw new Error('No active test');

      const updatedTest = { ...activeTest, ...updates };
      set({ activeTest: updatedTest });

      // Auto-save to backend if test exists
      if (activeTest.id) {
        const result = await testApiService.updateTest(activeTest.id, updatedTest);
        if (result.success) {
          set({ activeTest: result.data, error: null });
        } else {
          throw new Error(result.error);
        }
      }
    } catch (err: any) {
      const errorMsg = err.message;
      set({ error: errorMsg });
      toast.error(errorMsg);
    } finally {
      set({ saving: false });
    }
  },

  // Save test to backend
  saveTest: async () => {
    set({ loading: true });
    try {
      const { activeTest } = get();
      if (!activeTest) throw new Error('No active test');

      // Validate required fields
      if (!activeTest.title) throw new Error('Test title is required');
      if (!activeTest.category) throw new Error('Category is required');
      if (!activeTest.durationMinutes) throw new Error('Duration is required');
      if (!activeTest.questions?.length) throw new Error('At least one question is required');

      // Calculate total marks
      const totalMarks = activeTest.questions.reduce(
        (sum: number, q: any) => sum + (q.marks || 0),
        0
      );

      const testData = {
        ...activeTest,
        totalMarks
      };

      let result;
      if (activeTest.id) {
        // Update existing
        result = await testApiService.updateTest(activeTest.id, testData);
      } else {
        // Create new
        result = await testApiService.createTest(testData);
      }

      if (result.success) {
        set({ activeTest: result.data, error: null });
        toast.success(activeTest.id ? 'Test updated successfully' : 'Test created successfully');
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      const errorMsg = err.message;
      set({ error: errorMsg });
      toast.error(errorMsg);
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  // Publish test (change status to published)
  publishTest: async () => {
    set({ loading: true });
    try {
      const { activeTest } = get();
      if (!activeTest?.id) throw new Error('Test must be saved first');

      const result = await testApiService.updateTest(activeTest.id, {
        ...activeTest,
        status: 'published'
      });

      if (result.success) {
        set({ activeTest: result.data });
        toast.success('Test published successfully');
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  // Delete test
  deleteTest: async (testId: string) => {
    set({ loading: true });
    try {
      const result = await testApiService.deleteTest(testId);
      if (result.success) {
        set({ activeTest: null, questions: [] });
        toast.success('Test deleted successfully');
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  // Add new question
  addQuestion: (question) => {
    const newQuestion = question || {
      id: generateId(),
      text: '',
      marks: 1,
      allowMultiple: false,
      options: [
        { id: generateId(), text: '' },
        { id: generateId(), text: '' }
      ],
      correctAnswers: [],
      explanation: ''
    };

    set((state) => {
      const updatedQuestions = [...(state.activeTest?.questions || []), newQuestion];
      return {
        questions: updatedQuestions,
        activeTest: {
          ...state.activeTest,
          questions: updatedQuestions
        }
      };
    });
  },

  // Update question
  updateQuestion: (id: string, updates: any) => {
    set((state) => {
      const updatedQuestions = state.questions.map((q) =>
        q.id === id ? { ...q, ...updates } : q
      );
      return {
        questions: updatedQuestions,
        activeTest: {
          ...state.activeTest,
          questions: updatedQuestions
        }
      };
    });
  },

  // Delete question
  deleteQuestion: (id: string) => {
    set((state) => {
      const updatedQuestions = state.questions.filter((q) => q.id !== id);
      return {
        questions: updatedQuestions,
        activeTest: {
          ...state.activeTest,
          questions: updatedQuestions
        }
      };
    });
  },

  // Duplicate question
  duplicateQuestion: (id: string) => {
    set((state) => {
      const questionToDuplicate = state.questions.find((q) => q.id === id);
      if (!questionToDuplicate) return state;

      const duplicated = {
        ...questionToDuplicate,
        id: generateId(),
        options: questionToDuplicate.options.map((o: any) => ({
          ...o,
          id: generateId()
        }))
      };

      const updatedQuestions = [
        ...state.questions.slice(0, state.questions.indexOf(questionToDuplicate) + 1),
        duplicated,
        ...state.questions.slice(state.questions.indexOf(questionToDuplicate) + 1)
      ];

      return {
        questions: updatedQuestions,
        activeTest: {
          ...state.activeTest,
          questions: updatedQuestions
        }
      };
    });
  },

  // Reorder questions
  reorderQuestions: (questions: any[]) => {
    set({
      questions,
      activeTest: {
        ...get().activeTest,
        questions
      }
    });
  },

  // Save all questions to backend
  saveAllQuestions: async () => {
    const { activeTest, saveTest } = get();
    if (!activeTest) return;

    try {
      await saveTest();
      toast.success('Questions saved');
    } catch (err) {
      console.error('Failed to save questions:', err);
    }
  },

  // Set error
  setError: (error) => set({ error }),

  // Clear test
  clearTest: () => {
    set({
      activeTest: null,
      questions: [],
      error: null
    });
  },

  // Load test from backend
  loadTest: async (testId: string) => {
    set({ loading: true });
    try {
      const result = await testApiService.fetchTestById(testId);
      if (result.success) {
        set({
          activeTest: result.data,
          questions: result.data.questions || [],
          error: null
        });
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      set({ error: err.message });
      toast.error(err.message);
    } finally {
      set({ loading: false });
    }
  }
}));
