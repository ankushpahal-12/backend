/**
 * Data Transfer Objects (DTOs) for Test model.
 * Centralizes the shaping of data returned to clients to prevent accidental data leakage.
 */

/**
 * Admin DTO
 * Full data visibility, including correct answers, settings, and edit history.
 * Used for admin dashboard, test editing, and analytics.
 */
export const formatAdminTestDTO = (testDoc) => {
  if (!testDoc) return null;
  const test = testDoc.toObject ? testDoc.toObject() : testDoc;
  
  // Return everything but the internal MongoDB fields
  const { _id, __v, ...rest } = test;
  return {
    ...rest,
    id: rest.testId, // Expose custom ID as id
  };
};

/**
 * Candidate Attempt DTO
 * Strict sanitization. Removes correct answers, edit history, and internal settings.
 * Used when a candidate starts or resumes an attempt.
 */
export const formatCandidateDTO = (testDoc) => {
  if (!testDoc) return null;
  const test = testDoc.toObject ? testDoc.toObject() : testDoc;

  // Sanitize questions: strictly remove correctAnswers
  const sanitizedQuestions = test.questions ? test.questions.map(q => {
    const { correctAnswers, ...safeQuestion } = q;
    return safeQuestion;
  }) : [];

  return {
    id: test.testId,
    testId: test.testId,
    title: test.title,
    description: test.description,
    durationMinutes: test.durationMinutes,
    totalMarks: test.totalMarks,
    category: test.category,
    instructions: test.instructions,
    questions: sanitizedQuestions,
    // Provide only settings that matter to the candidate UI, exclude internal ones
    settings: {
      allowReview: test.settings?.allowReview,
      oneQuestionPerPage: test.settings?.oneQuestionPerPage,
      negativeMarking: test.settings?.negativeMarking,
      passingMarks: test.settings?.passingMarks
    }
  };
};

/**
 * Preview DTO
 * Extremely lightweight payload for public/unauthorized viewing.
 * NEVER returns the questions array.
 */
export const formatPreviewDTO = (testDoc) => {
  if (!testDoc) return null;
  const test = testDoc.toObject ? testDoc.toObject() : testDoc;

  return {
    id: test.testId,
    testId: test.testId,
    title: test.title,
    description: test.description,
    durationMinutes: test.durationMinutes,
    totalMarks: test.totalMarks,
    category: test.category,
    instructions: test.instructions,
    startAt: test.startAt || null,
    endAt: test.endAt || null,
    visibility: test.accessControl?.visibility || 'public',
    accessControl: {
      visibility: test.accessControl?.visibility || 'public',
      requireLogin: test.accessControl?.requireLogin ?? true
    }
    // No questions returned!
  };
};
