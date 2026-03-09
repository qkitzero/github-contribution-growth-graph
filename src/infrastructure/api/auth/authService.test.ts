import { AuthError, AuthServiceImpl } from './authService';

describe('AuthServiceImpl', () => {
  const setup = () => {
    const mockClient = {
      POST: jest.fn(),
    } as any;
    const authService = new AuthServiceImpl(mockClient, 'test-client-id', 'test-client-secret');
    return { mockClient, authService };
  };

  describe('getM2MToken', () => {
    it('should return accessToken on success', async () => {
      const { mockClient, authService } = setup();

      mockClient.POST.mockResolvedValue({
        data: { accessToken: 'test-token' },
        error: undefined,
      });

      const result = await authService.getM2MToken();

      expect(result).toBe('test-token');
      expect(mockClient.POST).toHaveBeenCalledWith('/v1/m2m-token', {
        body: {
          clientId: 'test-client-id',
          clientSecret: 'test-client-secret',
        },
      });
    });

    it('should throw AuthError when API returns error with message', async () => {
      const { mockClient, authService } = setup();

      mockClient.POST.mockResolvedValue({
        data: undefined,
        error: { message: 'Invalid credentials' },
      });

      await expect(authService.getM2MToken()).rejects.toThrow(AuthError);
      await expect(authService.getM2MToken()).rejects.toThrow('Invalid credentials');
    });

    it('should throw AuthError with fallback message when API returns error without message', async () => {
      const { mockClient, authService } = setup();

      mockClient.POST.mockResolvedValue({
        data: undefined,
        error: { message: '' },
      });

      await expect(authService.getM2MToken()).rejects.toThrow(AuthError);
      await expect(authService.getM2MToken()).rejects.toThrow('Failed to get m2m token');
    });

    it('should throw AuthError when accessToken is undefined', async () => {
      const { mockClient, authService } = setup();

      mockClient.POST.mockResolvedValue({
        data: { accessToken: undefined },
        error: undefined,
      });

      await expect(authService.getM2MToken()).rejects.toThrow(AuthError);
      await expect(authService.getM2MToken()).rejects.toThrow('Access token is missing');
    });

    it('should throw AuthError when accessToken is empty string', async () => {
      const { mockClient, authService } = setup();

      mockClient.POST.mockResolvedValue({
        data: { accessToken: '' },
        error: undefined,
      });

      await expect(authService.getM2MToken()).rejects.toThrow(AuthError);
      await expect(authService.getM2MToken()).rejects.toThrow('Access token is missing');
    });
  });

  describe('AuthError', () => {
    it('should be an instance of Error', () => {
      const error = new AuthError('test error');

      expect(error).toBeInstanceOf(Error);
    });

    it('should have name set to AuthError', () => {
      const error = new AuthError('test error');

      expect(error.name).toBe('AuthError');
    });
  });
});
