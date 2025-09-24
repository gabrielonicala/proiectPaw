/**
 * Centralized logging utility for the Quillia app
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  userId?: string;
  metadata?: Record<string, any>;
  timestamp: string;
  requestId?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  private formatLog(entry: LogEntry): string {
    const { level, message, context, userId, metadata, timestamp, requestId } = entry;
    
    if (this.isDevelopment) {
      // Human-readable format for development
      const emoji = {
        [LogLevel.DEBUG]: '🔍',
        [LogLevel.INFO]: 'ℹ️',
        [LogLevel.WARN]: '⚠️',
        [LogLevel.ERROR]: '❌',
      }[level];
      
      let logMessage = `${emoji} [${level.toUpperCase()}] ${message}`;
      
      if (context) logMessage += ` | Context: ${context}`;
      if (userId) logMessage += ` | User: ${userId}`;
      if (requestId) logMessage += ` | Request: ${requestId}`;
      if (metadata && Object.keys(metadata).length > 0) {
        logMessage += ` | Data: ${JSON.stringify(metadata, null, 2)}`;
      }
      
      return logMessage;
    } else {
      // Structured JSON format for production
      return JSON.stringify(entry);
    }
  }

  private log(level: LogLevel, message: string, context?: string, metadata?: Record<string, any>, userId?: string, requestId?: string) {
    const entry: LogEntry = {
      level,
      message,
      context,
      userId,
      metadata,
      timestamp: new Date().toISOString(),
      requestId,
    };

    const formattedLog = this.formatLog(entry);

    // Use appropriate console method
    switch (level) {
      case LogLevel.DEBUG:
        if (this.isDevelopment) console.debug(formattedLog);
        break;
      case LogLevel.INFO:
        console.info(formattedLog);
        break;
      case LogLevel.WARN:
        console.warn(formattedLog);
        break;
      case LogLevel.ERROR:
        console.error(formattedLog);
        break;
    }

    // In production, you might want to send logs to an external service
    if (this.isProduction && level === LogLevel.ERROR) {
      // Example: Send to Sentry, LogRocket, or other monitoring service
      // this.sendToMonitoringService(entry);
    }
  }

  debug(message: string, context?: string, metadata?: Record<string, any>, userId?: string, requestId?: string) {
    this.log(LogLevel.DEBUG, message, context, metadata, userId, requestId);
  }

  info(message: string, context?: string, metadata?: Record<string, any>, userId?: string, requestId?: string) {
    this.log(LogLevel.INFO, message, context, metadata, userId, requestId);
  }

  warn(message: string, context?: string, metadata?: Record<string, any>, userId?: string, requestId?: string) {
    this.log(LogLevel.WARN, message, context, metadata, userId, requestId);
  }

  error(message: string, context?: string, metadata?: Record<string, any>, userId?: string, requestId?: string) {
    this.log(LogLevel.ERROR, message, context, metadata, userId, requestId);
  }

  // Convenience methods for common scenarios
  apiRequest(method: string, endpoint: string, userId?: string, requestId?: string) {
    this.info(`API Request: ${method} ${endpoint}`, 'API', { method, endpoint }, userId, requestId);
  }

  apiResponse(method: string, endpoint: string, statusCode: number, duration: number, userId?: string, requestId?: string) {
    this.info(`API Response: ${method} ${endpoint} - ${statusCode} (${duration}ms)`, 'API', { 
      method, 
      endpoint, 
      statusCode, 
      duration 
    }, userId, requestId);
  }

  userAction(action: string, userId: string, metadata?: Record<string, any>, requestId?: string) {
    this.info(`User Action: ${action}`, 'USER', metadata, userId, requestId);
  }

  authEvent(event: string, userId?: string, metadata?: Record<string, any>, requestId?: string) {
    this.info(`Auth Event: ${event}`, 'AUTH', metadata, userId, requestId);
  }

  paymentEvent(event: string, userId?: string, metadata?: Record<string, any>, requestId?: string) {
    this.info(`Payment Event: ${event}`, 'PAYMENT', metadata, userId, requestId);
  }

  aiGeneration(type: 'story' | 'image' | 'video', userId: string, metadata?: Record<string, any>, requestId?: string) {
    this.info(`AI Generation: ${type}`, 'AI', metadata, userId, requestId);
  }

  databaseOperation(operation: string, table: string, userId?: string, metadata?: Record<string, any>, requestId?: string) {
    this.debug(`Database: ${operation} on ${table}`, 'DATABASE', metadata, userId, requestId);
  }

  performance(metric: string, value: number, unit: string, context?: string, userId?: string, requestId?: string) {
    this.info(`Performance: ${metric} = ${value}${unit}`, context || 'PERFORMANCE', { metric, value, unit }, userId, requestId);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions
export const log = {
  debug: logger.debug.bind(logger),
  info: logger.info.bind(logger),
  warn: logger.warn.bind(logger),
  error: logger.error.bind(logger),
  apiRequest: logger.apiRequest.bind(logger),
  apiResponse: logger.apiResponse.bind(logger),
  userAction: logger.userAction.bind(logger),
  authEvent: logger.authEvent.bind(logger),
  paymentEvent: logger.paymentEvent.bind(logger),
  aiGeneration: logger.aiGeneration.bind(logger),
  databaseOperation: logger.databaseOperation.bind(logger),
  performance: logger.performance.bind(logger),
};
