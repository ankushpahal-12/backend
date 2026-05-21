export const parseError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.stack ? error.stack.toString() : error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return 'An unknown error occurred';
  }
};
