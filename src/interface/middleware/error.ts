import { NextFunction, Request, Response } from 'express';
import { AuthError } from '../../infrastructure/api/auth/authService';
import { LoggingError } from '../../infrastructure/api/logging/loggingService';

export class ErrorMiddleware {
  static handle = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    const statusCode = ErrorMiddleware.getStatusCode(err);
    res.status(statusCode).json({
      error: ErrorMiddleware.getErrorName(err),
      message: err.message,
    });
  };

  private static getStatusCode(err: Error): number {
    if (err instanceof AuthError) return 502;
    if (err instanceof LoggingError) return 502;
    return 500;
  }

  private static getErrorName(err: Error): string {
    if (err instanceof AuthError) return err.name;
    if (err instanceof LoggingError) return err.name;
    return 'InternalServerError';
  }
}
