import createClient from 'openapi-fetch';
import { LoggingError } from '../../../application/errors';
import { LoggingServiceImpl } from './loggingService';
import { paths } from './schema';

describe('LoggingServiceImpl', () => {
  const setup = () => {
    const mockPOST = jest.fn();
    const mockClient = { POST: mockPOST } as unknown as ReturnType<typeof createClient<paths>>;
    const loggingService = new LoggingServiceImpl(mockClient);
    return { mockPOST, loggingService };
  };

  describe('createLog', () => {
    it('should return log id on success', async () => {
      const { mockPOST, loggingService } = setup();

      mockPOST.mockResolvedValue({
        data: { id: 'log-123' },
        error: undefined,
      });

      const result = await loggingService.createLog(
        'bearer-token',
        'my-service',
        'info',
        'test message',
      );

      expect(result).toBe('log-123');
      expect(mockPOST).toHaveBeenCalledWith('/v1/logs', {
        headers: { Authorization: 'Bearer bearer-token' },
        body: {
          serviceName: 'my-service',
          level: 'info',
          message: 'test message',
        },
      });
    });

    it('should throw LoggingError when API returns error with message', async () => {
      const { mockPOST, loggingService } = setup();

      mockPOST.mockResolvedValue({
        data: undefined,
        error: { message: 'Unauthorized' },
      });

      await expect(loggingService.createLog('token', 'svc', 'error', 'msg')).rejects.toThrow(
        LoggingError,
      );
      await expect(loggingService.createLog('token', 'svc', 'error', 'msg')).rejects.toThrow(
        'Unauthorized',
      );
    });

    it('should throw LoggingError with fallback message when API returns error without message', async () => {
      const { mockPOST, loggingService } = setup();

      mockPOST.mockResolvedValue({
        data: undefined,
        error: { message: '' },
      });

      await expect(loggingService.createLog('token', 'svc', 'error', 'msg')).rejects.toThrow(
        LoggingError,
      );
      await expect(loggingService.createLog('token', 'svc', 'error', 'msg')).rejects.toThrow(
        'Failed to create log',
      );
    });
  });

  describe('LoggingError', () => {
    it('should be an instance of Error', () => {
      const error = new LoggingError('test error');

      expect(error).toBeInstanceOf(Error);
    });

    it('should have name set to LoggingError', () => {
      const error = new LoggingError('test error');

      expect(error.name).toBe('LoggingError');
    });
  });
});
