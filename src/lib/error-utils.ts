/**
 * Error handling utilities for production safety
 */

import { logger } from './logger';

/**
 * Sanitize error messages for production
 * Returns safe error messages that don't expose internal details
 */
export function sanitizeError(error: unknown, context?: string): {
  message: string;
  details?: string;
} {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (error instanceof Error) {
    // In development, show full error details
    if (isDevelopment) {
      return {
        message: error.message,
        details: error.stack
      };
    }
    
    // In production, return safe generic messages
    const safeMessages: Record<string, string> = {
      'User not found': 'User not found',
      'Invalid credentials': 'Invalid credentials',
      'Email not verified': 'Please verify your email address',
      'Rate limit exceeded': 'Too many requests. Please try again later.',
      'Daily limit exceeded': 'Daily limit reached. Please try again tomorrow.',
      'Character slot limit reached': 'Character limit reached. Upgrade to create more characters.',
      'Missing required fields': 'Please fill in all required fields',
      'Invalid signature': 'Invalid request signature',
      'Webhook processing failed': 'Payment processing error',
      'Failed to generate story': 'Unable to generate story. Please try again.',
      'Failed to generate image': 'Unable to generate image. Please try again.',
      'Failed to save entry': 'Unable to save entry. Please try again.',
      'Failed to load entries': 'Unable to load entries. Please refresh the page.',
      'Failed to create character': 'Unable to create character. Please try again.',
      'Failed to delete character': 'Unable to delete character. Please try again.',
      'Failed to fetch subscription limits': 'Unable to load subscription information',
      'Internal server error': 'Something went wrong. Please try again.',
    };
    
    // Check if we have a safe message for this error
    const safeMessage = safeMessages[error.message] || 'Something went wrong. Please try again.';
    
    const result: { message: string; details?: string } = {
      message: safeMessage
    };
    
    if (context && isDevelopment) {
      result.details = `Context: ${context}`;
    }
    
    return result;
  }
  
  // Handle non-Error objects
  if (isDevelopment) {
    return {
      message: 'Unknown error occurred',
      details: String(error)
    };
  }
  
  return {
    message: 'Something went wrong. Please try again.'
  };
}

/**
 * Log error with context for debugging
 */
export function logError(error: unknown, context: string, additionalData?: Record<string, any>, userId?: string, requestId?: string) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  const metadata = {
    ...additionalData,
    stack: error instanceof Error ? error.stack : undefined,
    errorType: error instanceof Error ? error.constructor.name : typeof error,
  };
  
  logger.error(message, context, metadata, userId, requestId);
}

/**
 * Create a standardized API error response
 */
export function createErrorResponse(
  error: unknown, 
  context: string, 
  statusCode: number = 500,
  additionalData?: Record<string, any>,
  userId?: string,
  requestId?: string
) {
  const sanitized = sanitizeError(error, context);
  
  // Log the error for debugging
  logError(error, context, additionalData, userId, requestId);
  
  return {
    error: sanitized.message,
    ...(sanitized.details && { details: sanitized.details }),
    ...(additionalData && { ...additionalData }),
    timestamp: new Date().toISOString()
  };
}
