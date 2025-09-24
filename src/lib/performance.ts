/**
 * Performance monitoring utilities
 */

import { logger } from './logger';

export class PerformanceMonitor {
  private static timers = new Map<string, number>();
  private static metrics = new Map<string, number[]>();

  /**
   * Start timing an operation
   */
  static startTimer(operation: string): void {
    this.timers.set(operation, Date.now());
  }

  /**
   * End timing an operation and log the result
   */
  static endTimer(
    operation: string, 
    context?: string, 
    userId?: string, 
    requestId?: string,
    logThreshold: number = 1000 // Log if operation takes more than 1 second
  ): number {
    const startTime = this.timers.get(operation);
    if (!startTime) {
      logger.warn(`Timer not found for operation: ${operation}`, 'PERFORMANCE');
      return 0;
    }

    const duration = Date.now() - startTime;
    this.timers.delete(operation);

    // Store metric for analysis
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    this.metrics.get(operation)!.push(duration);

    // Log if operation is slow
    if (duration > logThreshold) {
      logger.performance(
        `Slow operation: ${operation}`,
        duration,
        'ms',
        context,
        userId,
        requestId
      );
    }

    return duration;
  }

  /**
   * Measure database operation performance
   */
  static async measureDatabase<T>(
    operation: string,
    dbOperation: () => Promise<T>,
    context?: string,
    userId?: string,
    requestId?: string
  ): Promise<T> {
    this.startTimer(`db_${operation}`);
    try {
      const result = await dbOperation();
      const duration = this.endTimer(`db_${operation}`, context, userId, requestId, 500);
      logger.databaseOperation(operation, 'database', userId, { duration }, requestId);
      return result;
    } catch (error) {
      this.endTimer(`db_${operation}`, context, userId, requestId);
      throw error;
    }
  }

  /**
   * Measure API operation performance
   */
  static async measureApi<T>(
    operation: string,
    apiOperation: () => Promise<T>,
    context?: string,
    userId?: string,
    requestId?: string
  ): Promise<T> {
    this.startTimer(`api_${operation}`);
    try {
      const result = await apiOperation();
      const duration = this.endTimer(`api_${operation}`, context, userId, requestId, 2000);
      logger.apiResponse('POST', operation, 200, duration, userId, requestId);
      return result;
    } catch (error) {
      this.endTimer(`api_${operation}`, context, userId, requestId);
      throw error;
    }
  }

  /**
   * Get performance statistics for an operation
   */
  static getStats(operation: string): {
    count: number;
    average: number;
    min: number;
    max: number;
    p95: number;
  } | null {
    const metrics = this.metrics.get(operation);
    if (!metrics || metrics.length === 0) {
      return null;
    }

    const sorted = [...metrics].sort((a, b) => a - b);
    const count = sorted.length;
    const average = sorted.reduce((sum, val) => sum + val, 0) / count;
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const p95Index = Math.floor(count * 0.95);
    const p95 = sorted[p95Index];

    return { count, average, min, max, p95 };
  }

  /**
   * Get all performance statistics
   */
  static getAllStats(): Record<string, ReturnType<typeof PerformanceMonitor.getStats>> {
    const stats: Record<string, ReturnType<typeof PerformanceMonitor.getStats>> = {};
    
    for (const operation of this.metrics.keys()) {
      stats[operation] = this.getStats(operation);
    }
    
    return stats;
  }

  /**
   * Clear all metrics (useful for testing or periodic cleanup)
   */
  static clearMetrics(): void {
    this.metrics.clear();
    this.timers.clear();
  }
}

// Export convenience functions
export const perf = {
  start: PerformanceMonitor.startTimer.bind(PerformanceMonitor),
  end: PerformanceMonitor.endTimer.bind(PerformanceMonitor),
  measureDb: PerformanceMonitor.measureDatabase.bind(PerformanceMonitor),
  measureApi: PerformanceMonitor.measureApi.bind(PerformanceMonitor),
  getStats: PerformanceMonitor.getStats.bind(PerformanceMonitor),
  getAllStats: PerformanceMonitor.getAllStats.bind(PerformanceMonitor),
  clear: PerformanceMonitor.clearMetrics.bind(PerformanceMonitor),
};
