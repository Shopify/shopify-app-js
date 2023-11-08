export function errorBoundary(error: any) {
  if (
    error.constructor.name === 'ErrorResponse' ||
    error.constructor.name === 'ErrorResponseImpl'
  ) {
    return (
      <div
        dangerouslySetInnerHTML={{__html: error.data || 'Handling response'}}
      />
    );
  }

  throw error;
}
