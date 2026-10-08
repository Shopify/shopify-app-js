import {isRouteErrorResponse} from 'react-router';

export function errorBoundary(error: any) {
  if (isRouteErrorResponse(error)) {
    return (
      <div
        dangerouslySetInnerHTML={{__html: error.data || 'Handling response'}}
      />
    );
  }

  throw error;
}
