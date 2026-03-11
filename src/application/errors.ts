export class ApplicationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends ApplicationError {}
export class AuthError extends ApplicationError {}
export class LoggingError extends ApplicationError {}
export class GitHubError extends ApplicationError {}
