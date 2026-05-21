export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  marks: number;
  allowMultiple: boolean;
  options: Option[];
}

export interface TestSettings {
  allowReview?: boolean;
  oneQuestionPerPage?: boolean;
  negativeMarking?: number;
  passingMarks?: number;
}

export interface CandidateTest {
  id: string;
  testId: string;
  title: string;
  description?: string;
  durationMinutes: number;
  totalMarks: number;
  category: string;
  instructions?: string;
  questions: Question[];
  settings: TestSettings;
}

export interface PublicTest {
  id: string;
  testId: string;
  title: string;
  description?: string;
  durationMinutes: number;
  totalMarks: number;
  category: string;
  instructions?: string;
}

export interface Answer {
  questionId: string;
  selectedOptions: string[];
  timeTaken: number;
}

export interface Attempt {
  _id: string;
  testId: string;
  userId: string;
  activeSessionId?: string;
  isAttemptInProgress: boolean;
  answers: Answer[];
  startedAt: string;
  status: 'in-progress' | 'submitted' | 'graded' | 'abandoned';
}

export interface QuestionStatus {
  id: string;
  status: 'answered' | 'not-answered' | 'marked-review' | 'not-visited';
}

export interface AttemptResult {
  attemptId: string;
  totalMarksObtained: number;
  totalMarksPossible: number;
  percentage: number;
  isPassed: boolean;
}
