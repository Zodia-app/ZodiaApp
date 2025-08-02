export const getErrorMessage = (error: any): string => {
  if (!navigator.onLine) {
    return 'No internet connection. Please check your network.';
  }
  
  if (error.code === 'TIMEOUT') {
    return 'Request timed out. Please try again.';
  }
  
  if (error.status === 401) {
    return 'Session expired. Please login again.';
  }
  
  return error.message || 'Something went wrong. Please try again.';
};