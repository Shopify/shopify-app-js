export function errorBoundary(error: unknown): string | never {
  if (error instanceof Response) {
    return 'Handling response';
  }

  throw error;
}
