export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  marks: number;
  options: Option[];
  correctAnswers: string[]; // Array of option IDs
  allowMultiple: boolean;
  explanation?: string;
  category?: string;
}

export interface TestSettings {
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showResultsImmediately: boolean;
  allowReview: boolean;
  showCorrectAnswers: boolean;
  oneQuestionPerPage: boolean;
}

export interface Test {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  totalMarks: number;
  category: string;
  instructions: string;
  settings: TestSettings;
  questions: Question[];
  status: 'draft' | 'published' | 'archived';
  publishedAccess?: string;
  startAt?: string | null;
  endAt?: string | null;
  assignedUsers?: Array<{
    _id: string;
    name?: string;
    email?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface TestAttempt {
  id: string;
  testId: string;
  userId: string;
  score: number;
  startedAt: string;
  completedAt: string;
  status: 'in_progress' | 'completed' | 'abandoned';
}
