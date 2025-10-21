export function formatErrorForDisplay(error: unknown): string {
  if (!error) return 'An error occurred';

  if (typeof error === 'string') return error;

  if (error instanceof Error) return error.message || 'An error occurred';

  if (typeof error === 'object') {
    try {
      // Common API error shapes
      const anyError = error as Record<string, unknown>;
      if (typeof anyError.message === 'string' && anyError.message) {
        return anyError.message as string;
      }
      if (typeof anyError.error === 'string' && anyError.error) {
        return anyError.error as string;
      }
      return JSON.stringify(anyError, null, 2);
    } catch {
      return 'An error occurred';
    }
  }

  try {
    return JSON.stringify(error);
  } catch {
    return 'An error occurred';
  }
}
