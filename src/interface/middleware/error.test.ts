import { NextFunction, Request, Response } from 'express';
import { AuthError, GitHubError, LoggingError, ValidationError } from '../../application/errors';
import { ErrorMiddleware } from './error';

describe('ErrorMiddleware', () => {
  const setup = () => {
    const mockRequest: Partial<Request> = {};
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockNext: NextFunction = jest.fn();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    return { mockRequest, mockResponse, mockNext, consoleErrorSpy };
  };

  describe('notFoundHandler', () => {
    it('should return 404 with NotFoundError response', () => {
      const { mockRequest, mockResponse } = setup();

      ErrorMiddleware.notFoundHandler(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'NotFoundError',
        message: 'The requested resource was not found',
      });
    });
  });

  describe('errorHandler', () => {
    it('should handle an error, log it, set status to 500, and send a JSON response', () => {
      const { mockRequest, mockResponse, mockNext, consoleErrorSpy } = setup();

      const error = new Error('Test error message');
      error.stack = 'Test error stack trace';

      ErrorMiddleware.errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(error.stack);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'InternalServerError',
        message: error.message,
      });
      expect(mockNext).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should handle an error without a stack, logging only the error message', () => {
      const { mockRequest, mockResponse, mockNext, consoleErrorSpy } = setup();

      const error = new Error('Another test error');
      delete error.stack;

      ErrorMiddleware.errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(undefined);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'InternalServerError',
        message: error.message,
      });
      expect(mockNext).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should return 400 for ValidationError', () => {
      const { mockRequest, mockResponse, mockNext, consoleErrorSpy } = setup();

      const error = new ValidationError('Missing required parameter');

      ErrorMiddleware.errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(error.stack);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'ValidationError',
        message: 'Missing required parameter',
      });
      expect(mockNext).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should return 502 for AuthError', () => {
      const { mockRequest, mockResponse, mockNext, consoleErrorSpy } = setup();

      const error = new AuthError('Auth failed');

      ErrorMiddleware.errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(error.stack);
      expect(mockResponse.status).toHaveBeenCalledWith(502);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'AuthError',
        message: 'Auth failed',
      });
      expect(mockNext).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should return 502 for LoggingError', () => {
      const { mockRequest, mockResponse, mockNext, consoleErrorSpy } = setup();

      const error = new LoggingError('Logging failed');

      ErrorMiddleware.errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(error.stack);
      expect(mockResponse.status).toHaveBeenCalledWith(502);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'LoggingError',
        message: 'Logging failed',
      });
      expect(mockNext).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should return 502 for GitHubError', () => {
      const { mockRequest, mockResponse, mockNext, consoleErrorSpy } = setup();

      const error = new GitHubError('GitHub API failed');

      ErrorMiddleware.errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(error.stack);
      expect(mockResponse.status).toHaveBeenCalledWith(502);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'GitHubError',
        message: 'GitHub API failed',
      });
      expect(mockNext).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });
});
