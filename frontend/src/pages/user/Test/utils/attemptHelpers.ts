import type { QuestionStatus, Answer, Question } from '../types/attempt.types';

export const formatTime = (seconds: number): string => {
  if (seconds < 0) return '00:00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const getQuestionStatusArray = (
  questions: Question[],
  answers: Answer[],
  reviewFlags: Record<string, boolean>,
  visitedQuestions: Record<string, boolean>
): QuestionStatus[] => {
  return questions.map((q) => {
    let status: QuestionStatus['status'] = 'not-visited';
    
    if (visitedQuestions[q.id]) {
      status = 'not-answered';
    }

    const answer = answers.find(a => a.questionId === q.id);
    if (answer && answer.selectedOptions.length > 0) {
      status = 'answered';
    }

    if (reviewFlags[q.id]) {
      status = 'marked-review';
    }

    return {
      id: q.id,
      status
    };
  });
};

export const calculateProgress = (answers: Answer[], totalQuestions: number): number => {
  if (totalQuestions === 0) return 0;
  const answeredCount = answers.filter(a => a.selectedOptions.length > 0).length;
  return Math.round((answeredCount / totalQuestions) * 100);
};
