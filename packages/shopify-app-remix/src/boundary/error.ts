export function errorBoundary(error: any): string | never {
  if (error.constructor.name === 'ErrorResponse') {
    return 'Handling response';
  }

  throw error;
}
