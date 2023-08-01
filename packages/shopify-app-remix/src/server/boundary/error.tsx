export function errorBoundary(error: any) {
  if (error.constructor.name === 'ErrorResponse') {
    return (
      <div
        dangerouslySetInnerHTML={{__html: error.data || 'Handling response'}}
      />
    );
  }

  throw error;
}
