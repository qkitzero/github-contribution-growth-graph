import { NextFunction, Request, Response } from 'express';

export class ErrorMiddleware {
  static handle = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
      error: 'InternalServerError',
      message: err.message,
    });
  };
}
