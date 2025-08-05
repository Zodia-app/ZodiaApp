// src/services/errorService.ts

// Error types enum
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  API_ERROR = 'API_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// Error message mapping
const errorMessages: Record<string, string> = {
  // Authentication errors
  'auth/user-not-found': 'No account found with this email',
  'auth/wrong-password': 'Incorrect password',
  'auth/invalid-email': 'Please enter a valid email address',
  'auth/email-already-in-use': 'This email is already registered',
  'auth/weak-password': 'Password should be at least 6 characters',
  'auth/user-disabled': 'This account has been disabled',
  'auth/too-many-requests': 'Too many attempts. Please try again later',
  'auth/network-request-failed': 'Network error. Please check your connection',
  
  // Network errors
  'network/offline': 'No internet connection',
  'network/timeout': 'Request timed out. Please try again',
  'network/server-error': 'Server error. Please try again later',
  
  // API errors
  'api/rate-limit': 'Too many requests. Please wait a moment',
  'api/server-error': 'Server error. Please try again later',
  'api/not-found': 'Requested resource not found',
  'api/unauthorized': 'You need to be logged in to do this',
  
  // Permission errors
  'permission/camera-denied': 'Camera permission is required for palm reading',
  'permission/location-denied': 'Location permission is required for accurate readings',
  'permission/storage-denied': 'Storage permission is required to save images',
  
  // Payment errors
  'payment/card-declined': 'Your card was declined',
  'payment/insufficient-funds': 'Insufficient funds',
  'payment/expired-card': 'Your card has expired',
  'payment/processing-error': 'Payment could not be processed',
  
  // Validation errors
  'validation/invalid-date': 'Please enter a valid date',
  'validation/required-field': 'This field is required',
  'validation/invalid-time': 'Please enter a valid time',
  'validation/invalid-email': 'Please enter a valid email',
  
  // OpenAI errors
  'openai/quota-exceeded': 'AI service temporarily unavailable',
  'openai/invalid-request': 'Could not process your request',
  'openai/timeout': 'AI generation timed out. Please try again',
  
  // Default
  'unknown': 'An unexpected error occurred. Please try again.'
}

// Interface for handled errors
export interface HandledError {
  type: ErrorType;
  message: string;
  isRecoverable: boolean;
  originalError: any;
  suggestedAction?: string;
}

// Error service class
export class ErrorService {
  // Get user-friendly message from error code
  static getMessage(errorCode: string): string {
    return errorMessages[errorCode] || errorMessages['unknown'];
  }
  
  // Determine error type from error object
  static getErrorType(error: any): ErrorType {
    const errorCode = error?.code || error?.message || '';
    
    if (errorCode.includes('auth') || error?.statusCode === 401) {
      return ErrorType.AUTH_ERROR;
    }
    if (errorCode.includes('network') || errorCode.includes('fetch') || !navigator.onLine) {
      return ErrorType.NETWORK_ERROR;
    }
    if (errorCode.includes('permission')) {
      return ErrorType.PERMISSION_ERROR;
    }
    if (errorCode.includes('api') || error?.statusCode >= 500) {
      return ErrorType.API_ERROR;
    }
    if (errorCode.includes('validation') || error?.statusCode === 400) {
      return ErrorType.VALIDATION_ERROR;
    }
    
    return ErrorType.UNKNOWN_ERROR;
  }
  
  // Main error handler
  static handle(error: any): HandledError {
    const errorType = this.getErrorType(error);
    const errorCode = error?.code || error?.message || 'unknown';
    const message = this.getMessage(errorCode);
    const isRecoverable = this.isRecoverable(errorType);
    const suggestedAction = this.getSuggestedAction(errorType);
    
    // Log to analytics
    this.logError(error, errorType);
    
    return {
      type: errorType,
      message,
      isRecoverable,
      originalError: error,
      suggestedAction
    };
  }
  
  // Check if error is recoverable
  static isRecoverable(errorType: ErrorType): boolean {
    return [
      ErrorType.NETWORK_ERROR,
      ErrorType.API_ERROR
    ].includes(errorType);
  }
  
  // Get suggested action for error type
  static getSuggestedAction(errorType: ErrorType): string {
    switch (errorType) {
      case ErrorType.NETWORK_ERROR:
        return 'Check your internet connection and try again';
      case ErrorType.AUTH_ERROR:
        return 'Please check your credentials and try again';
      case ErrorType.PERMISSION_ERROR:
        return 'Grant the required permissions in settings';
      case ErrorType.API_ERROR:
        return 'Please try again in a few moments';
      case ErrorType.VALIDATION_ERROR:
        return 'Please check your input and try again';
      default:
        return 'Please try again';
    }
  }
  
  // Log to analytics service
  static async logError(error: any, errorType: ErrorType): Promise<void> {
    try {
      // Log to console in development
      if (__DEV__) {
        console.error(`[${errorType}]`, error);
      }
      
      // Log to analytics (implement based on your analytics service)
      // Example with Amplitude:
      // Analytics.track('Error_Occurred', {
      //   error_type: errorType,
      //   error_message: error?.message,
      //   error_code: error?.code,
      //   error_stack: error?.stack,
      //   timestamp: new Date().toISOString()
      // });
      
    } catch (loggingError) {
      // Fail silently - don't throw errors from error handler
      console.error('Failed to log error:', loggingError);
    }
  }
  
  // Retry logic for failed requests
  static async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: any;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        // Don't retry if not recoverable
        const handledError = this.handle(error);
        if (!handledError.isRecoverable) {
          throw error;
        }
        
        // Wait before retrying (exponential backoff)
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
      }
    }
    
    throw lastError;
  }
  
  // Network error detection
  static isNetworkError(error: any): boolean {
    return (
      !navigator.onLine ||
      error?.code === 'network/offline' ||
      error?.message?.includes('network') ||
      error?.message?.includes('fetch')
    );
  }
  
  // Create custom error
  static createError(type: ErrorType, message: string, code?: string): Error {
    const error = new Error(message) as any;
    error.type = type;
    error.code = code || type.toLowerCase();
    return error;
  }
}

// Export for easy use
export default ErrorService;