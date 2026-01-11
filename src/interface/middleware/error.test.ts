import { NextFunction, Request, Response } from 'express';
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

  it('should handle an error, log it, set status to 500, and send a JSON response', () => {
    const { mockRequest, mockResponse, mockNext, consoleErrorSpy } = setup();

    const error = new Error('Test error message');
    error.stack = 'Test error stack trace';

    ErrorMiddleware.handle(error, mockRequest as Request, mockResponse as Response, mockNext);

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

    ErrorMiddleware.handle(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(consoleErrorSpy).toHaveBeenCalledWith(undefined);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'InternalServerError',
      message: error.message,
    });
    expect(mockNext).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
