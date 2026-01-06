/**
 * Standard response formats for API
 */

export function successResponse(data, message = null) {
  const response = { data };
  if (message) {
    response.message = message;
  }
  return response;
}

export function errorResponse(message, code = 'ERROR') {
  return {
    error: {
      message,
      code,
    },
  };
}
