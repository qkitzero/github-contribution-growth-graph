import { ApplicationError, AuthError, GitHubError, LoggingError, ValidationError } from './errors';

describe('Error classes', () => {
  it('ValidationError should have correct name and message', () => {
    const error = new ValidationError('Invalid input');
    expect(error).toBeInstanceOf(ApplicationError);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ValidationError');
    expect(error.message).toBe('Invalid input');
  });

  it('AuthError should have correct name and message', () => {
    const error = new AuthError('Auth failed');
    expect(error).toBeInstanceOf(ApplicationError);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('AuthError');
    expect(error.message).toBe('Auth failed');
  });

  it('LoggingError should have correct name and message', () => {
    const error = new LoggingError('Logging failed');
    expect(error).toBeInstanceOf(ApplicationError);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('LoggingError');
    expect(error.message).toBe('Logging failed');
  });

  it('GitHubError should have correct name and message', () => {
    const error = new GitHubError('GitHub API failed');
    expect(error).toBeInstanceOf(ApplicationError);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('GitHubError');
    expect(error.message).toBe('GitHub API failed');
  });
});
