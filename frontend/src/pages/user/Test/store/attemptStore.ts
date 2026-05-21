import { create } from 'zustand';
import type { CandidateTest, Attempt, Answer, AttemptResult } from '../types/attempt.types';

interface AttemptState {
  test: CandidateTest | null;
  attempt: Attempt | null;
  answers: Record<string, Answer>; // Keyed by questionId
  reviewFlags: Record<string, boolean>; // Keyed by questionId
  visitedQuestions: Record<string, boolean>; // Keyed by questionId
  result: AttemptResult | null;
  
  // Actions
  setTestAndAttempt: (test: CandidateTest, attempt: Attempt) => void;
  updateAnswer: (questionId: string, selectedOptions: string[], timeTaken: number) => void;
  toggleReviewFlag: (questionId: string) => void;
  markVisited: (questionId: string) => void;
  setResult: (result: AttemptResult) => void;
  reset: () => void;
}

export const useAttemptStore = create<AttemptState>((set) => ({
  test: null,
  attempt: null,
  answers: {},
  reviewFlags: {},
  visitedQuestions: {},
  result: null,

  setTestAndAttempt: (test, attempt) => {
    // Populate answers from existing attempt if resuming
    const initialAnswers: Record<string, Answer> = {};
    const initialVisited: Record<string, boolean> = {};
    
    if (attempt.answers) {
      attempt.answers.forEach(a => {
        initialAnswers[a.questionId] = a;
        initialVisited[a.questionId] = true;
      });
    }

    set({ 
      test, 
      attempt, 
      answers: initialAnswers,
      visitedQuestions: initialVisited,
      result: null,
      reviewFlags: {}
    });
  },

  updateAnswer: (questionId, selectedOptions, timeTaken) => set((state) => ({
    answers: {
      ...state.answers,
      [questionId]: {
        questionId,
        selectedOptions,
        timeTaken: (state.answers[questionId]?.timeTaken || 0) + timeTaken
      }
    },
    visitedQuestions: {
      ...state.visitedQuestions,
      [questionId]: true
    }
  })),

  toggleReviewFlag: (questionId) => set((state) => ({
    reviewFlags: {
      ...state.reviewFlags,
      [questionId]: !state.reviewFlags[questionId]
    }
  })),

  markVisited: (questionId) => set((state) => ({
    visitedQuestions: {
      ...state.visitedQuestions,
      [questionId]: true
    }
  })),

  setResult: (result) => set({ result }),

  reset: () => set({
    test: null,
    attempt: null,
    answers: {},
    reviewFlags: {},
    visitedQuestions: {},
    result: null
  })
}));
