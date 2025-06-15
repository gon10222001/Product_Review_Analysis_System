/**
 * Logging utility
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
  level?: LogLevel;
  context?: string;
  data?: unknown;
}

class Logger {
  private static instance: Logger;
  private isDevelopment = import.meta.env.DEV;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  log(message: string, options: LogOptions = {}): void {
    const {
      level = 'info',
      context = '',
      data
    } = options;

    if (!this.isDevelopment && level === 'debug') {
      return;
    }

    const timestamp = new Date().toISOString();
    const contextStr = context ? `[${context}] ` : '';
    const logMessage = `${timestamp} ${contextStr}${message}`;

    switch (level) {
      case 'debug':
        console.debug(logMessage, data || '');
        break;
      case 'info':
        console.info(logMessage, data || '');
        break;
      case 'warn':
        console.warn(logMessage, data || '');
        break;
      case 'error':
        console.error(logMessage, data || '');
        break;
    }
  }

  debug(message: string, context?: string, data?: unknown): void {
    this.log(message, { level: 'debug', context, data });
  }

  info(message: string, context?: string, data?: unknown): void {
    this.log(message, { level: 'info', context, data });
  }

  warn(message: string, context?: string, data?: unknown): void {
    this.log(message, { level: 'warn', context, data });
  }

  error(message: string, context?: string, data?: unknown): void {
    this.log(message, { level: 'error', context, data });
  }
}

export const logger = Logger.getInstance();