export const apiClient = async (url: string, options: RequestInit = {}) => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch (e) {
      // JSON parse failed, use default message
    }
    throw new Error(errorMessage);
  }

  // Some endpoints might not return JSON (e.g. logout)
  if (response.status === 204) {
    return null;
  }

  return response.json();
};
