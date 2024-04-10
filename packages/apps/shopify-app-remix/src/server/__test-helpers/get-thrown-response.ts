export async function getThrownResponse(
  callback: (request: Request) => Promise<any>,
  request: Request,
): Promise<Response> {
  try {
    await callback(request);
  } catch (response) {
    if (!(response instanceof Response)) {
      throw new Error(
        `${request.method} request to ${request.url} threw an error instead of a response: ${response}`,
      );
    }
    return response;
  }

  throw new Error(`${request.method} request to ${request.url} did not throw`);
}
