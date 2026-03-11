import { NextFunction, Request, Response } from 'express';
import {
  ApplicationError,
  AuthError,
  GitHubError,
  LoggingError,
  ValidationError,
} from '../../application/errors';

export class ErrorMiddleware {
  private static readonly STATUS_MAP: ReadonlyArray<[new (...args: never[]) => Error, number]> = [
    [ValidationError, 400],
    [AuthError, 502],
    [LoggingError, 502],
    [GitHubError, 502],
  ];

  static notFoundHandler = (_req: Request, res: Response) => {
    res
      .status(404)
      .json({ error: 'NotFoundError', message: 'The requested resource was not found' });
  };

  static errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    const statusCode = ErrorMiddleware.resolveStatusCode(err);
    const errorName = err instanceof ApplicationError ? err.name : 'InternalServerError';
    res.status(statusCode).json({ error: errorName, message: err.message });
  };

  private static resolveStatusCode(err: Error): number {
    for (const [ErrorClass, code] of ErrorMiddleware.STATUS_MAP) {
      if (err instanceof ErrorClass) return code;
    }
    return 500;
  }
}
