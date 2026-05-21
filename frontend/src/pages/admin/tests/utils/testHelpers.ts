import type { Test, Question } from '../types/test.types';

export const calculateTotalMarks = (questions: Question[]): number => {
  return questions.reduce((total, q) => total + (Number(q.marks) || 0), 0);
};

export const validateTest = (test: Partial<Test>): string[] => {
  const errors: string[] = [];

  if (!test.title?.trim()) {
    errors.push('Test title is required');
  }

  if (!test.durationMinutes || test.durationMinutes <= 0) {
    errors.push('Test duration must be greater than 0');
  }

  if (!test.questions || test.questions.length === 0) {
    errors.push('Test must have at least one question');
  } else {
    test.questions.forEach((q, index) => {
      if (!q.text?.trim()) {
        errors.push(`Question ${index + 1} text is required`);
      }
      if (!q.options || q.options.length < 2) {
        errors.push(`Question ${index + 1} must have at least 2 options`);
      } else {
        const emptyOptions = q.options.filter(opt => !opt.text?.trim());
        if (emptyOptions.length > 0) {
          errors.push(`Question ${index + 1} has empty options`);
        }
      }
      if (!q.correctAnswers || q.correctAnswers.length === 0) {
        errors.push(`Question ${index + 1} must have at least one correct answer`);
      }
      if (q.marks <= 0) {
        errors.push(`Question ${index + 1} marks must be greater than 0`);
      }
    });
  }

  return errors;
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
};
