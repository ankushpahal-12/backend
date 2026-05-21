import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Test, Question } from '../types/test.types';
import { calculateTotalMarks, generateId } from '../utils/testHelpers';

interface TestState {
  activeTest: Partial<Test> | null;
  isDraft: boolean;
  hasUnsavedChanges: boolean;
  selectedQuestionId: string | null;
}

type Action =
  | { type: 'SET_TEST'; payload: Partial<Test> }
  | { type: 'UPDATE_TEST_INFO'; payload: Partial<Test> }
  | { type: 'ADD_QUESTION'; payload: Question }
  | { type: 'UPDATE_QUESTION'; payload: { id: string; question: Partial<Question> } }
  | { type: 'DELETE_QUESTION'; payload: string }
  | { type: 'DUPLICATE_QUESTION'; payload: string }
  | { type: 'REORDER_QUESTIONS'; payload: Question[] }
  | { type: 'SET_SELECTED_QUESTION'; payload: string | null }
  | { type: 'MARK_SAVED' }
  | { type: 'RESET' };

const initialState: TestState = {
  activeTest: null,
  isDraft: true,
  hasUnsavedChanges: false,
  selectedQuestionId: null,
};

const defaultNewTest: Partial<Test> = {
  title: '',
  description: '',
  durationMinutes: 60,
  totalMarks: 0,
  category: '',
  instructions: '',
  settings: {
    shuffleQuestions: false,
    shuffleOptions: false,
    showResultsImmediately: true,
    allowReview: true,
    showCorrectAnswers: false,
    oneQuestionPerPage: false,
  },
  questions: [],
  status: 'draft',
};

const testReducer = (state: TestState, action: Action): TestState => {
  switch (action.type) {
    case 'SET_TEST':
      return {
        ...state,
        activeTest: { ...defaultNewTest, ...action.payload },
        hasUnsavedChanges: false,
      };
    case 'UPDATE_TEST_INFO':
      return {
        ...state,
        activeTest: { ...state.activeTest, ...action.payload },
        hasUnsavedChanges: true,
      };
    case 'ADD_QUESTION': {
      const updatedQuestions = [...(state.activeTest?.questions || []), action.payload];
      return {
        ...state,
        activeTest: {
          ...state.activeTest,
          questions: updatedQuestions,
          totalMarks: calculateTotalMarks(updatedQuestions),
        },
        hasUnsavedChanges: true,
      };
    }
    case 'UPDATE_QUESTION': {
      const updatedQuestions = (state.activeTest?.questions || []).map((q) =>
        q.id === action.payload.id ? { ...q, ...action.payload.question } : q
      );
      return {
        ...state,
        activeTest: {
          ...state.activeTest,
          questions: updatedQuestions,
          totalMarks: calculateTotalMarks(updatedQuestions),
        },
        hasUnsavedChanges: true,
      };
    }
    case 'DELETE_QUESTION': {
      const updatedQuestions = (state.activeTest?.questions || []).filter(
        (q) => q.id !== action.payload
      );
      return {
        ...state,
        activeTest: {
          ...state.activeTest,
          questions: updatedQuestions,
          totalMarks: calculateTotalMarks(updatedQuestions),
        },
        hasUnsavedChanges: true,
      };
    }
    case 'DUPLICATE_QUESTION': {
      const questions = state.activeTest?.questions || [];
      const questionToDuplicate = questions.find((q) => q.id === action.payload);
      if (!questionToDuplicate) return state;

      const newQuestion = {
        ...questionToDuplicate,
        id: generateId(),
      };
      
      const targetIndex = questions.findIndex((q) => q.id === action.payload);
      const updatedQuestions = [
        ...questions.slice(0, targetIndex + 1),
        newQuestion,
        ...questions.slice(targetIndex + 1)
      ];

      return {
        ...state,
        activeTest: {
          ...state.activeTest,
          questions: updatedQuestions,
          totalMarks: calculateTotalMarks(updatedQuestions),
        },
        hasUnsavedChanges: true,
      };
    }
    case 'REORDER_QUESTIONS':
      return {
        ...state,
        activeTest: {
          ...state.activeTest,
          questions: action.payload,
        },
        hasUnsavedChanges: true,
      };
    case 'SET_SELECTED_QUESTION':
      return {
        ...state,
        selectedQuestionId: action.payload,
      };
    case 'MARK_SAVED':
      return {
        ...state,
        hasUnsavedChanges: false,
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

const TestContext = createContext<{
  state: TestState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export const TestProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(testReducer, initialState);

  return (
    <TestContext.Provider value={{ state, dispatch }}>
      {children}
    </TestContext.Provider>
  );
};

export const useTestStore = () => {
  const context = useContext(TestContext);
  if (!context) {
    throw new Error('useTestStore must be used within a TestProvider');
  }
  return context;
};
