import createClient from 'openapi-fetch';
import { LoggingService } from '../../../application/loggingService';
import { paths } from './schema';

export class LoggingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LoggingError';
  }
}

export class LoggingServiceImpl implements LoggingService {
  constructor(private readonly client: ReturnType<typeof createClient<paths>>) {}

  async createLog(serviceName: string, level: string, message: string): Promise<string> {
    const { data, error } = await this.client.POST('/logs', {
      body: {
        serviceName: serviceName,
        level: level,
        message: message,
      },
    });

    if (error) {
      throw new LoggingError(error.message || 'Failed to create log');
    }

    return data.id;
  }
}
