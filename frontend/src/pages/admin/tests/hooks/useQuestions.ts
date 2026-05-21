import { useState, useCallback } from 'react';
import { useTestStore } from '../store/testStore';
import type { Question } from './useTests';
import toast from 'react-hot-toast';

export const useQuestions = () => {
  const {
    questions,
    addQuestion: storeAddQuestion,
    updateQuestion: storeUpdateQuestion,
    deleteQuestion: storeDeleteQuestion,
    duplicateQuestion: storeDuplicateQuestion,
    reorderQuestions: storeReorderQuestions,
    saveAllQuestions
  } = useTestStore();

  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  // Add question
  const addQuestion = useCallback(() => {
    storeAddQuestion();
    toast.success('Question added');
  }, [storeAddQuestion]);

  // Update question
  const updateQuestion = useCallback((id: string, updates: Partial<Question>) => {
    storeUpdateQuestion(id, updates);
  }, [storeUpdateQuestion]);

  // Delete question
  const removeQuestion = useCallback((id: string) => {
    storeDeleteQuestion(id);
    if (selectedQuestionId === id) {
      setSelectedQuestionId(null);
    }
    toast.success('Question deleted');
  }, [storeDeleteQuestion, selectedQuestionId]);

  // Duplicate question
  const duplicateQuestion = useCallback((id: string) => {
    storeDuplicateQuestion(id);
    toast.success('Question duplicated');
  }, [storeDuplicateQuestion]);

  // Reorder questions
  const reorderQuestions = useCallback((newQuestions: Question[]) => {
    storeReorderQuestions(newQuestions);
    saveAllQuestions();
  }, [storeReorderQuestions, saveAllQuestions]);

  // Select question
  const selectQuestion = useCallback((id: string | null) => {
    setSelectedQuestionId(id);
  }, []);

  return {
    questions,
    selectedQuestionId,
    addQuestion,
    updateQuestion,
    removeQuestion,
    duplicateQuestion,
    reorderQuestions,
    selectQuestion,
    saveAllQuestions
  };
};
