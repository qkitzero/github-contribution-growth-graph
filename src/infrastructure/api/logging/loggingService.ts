import createClient from 'openapi-fetch';
import { LoggingError } from '../../../application/errors';
import { LoggingService } from '../../../application/loggingService';
import { paths } from './schema';

export class LoggingServiceImpl implements LoggingService {
  constructor(private readonly client: ReturnType<typeof createClient<paths>>) {}

  async createLog(
    token: string,
    serviceName: string,
    level: string,
    message: string,
  ): Promise<string> {
    const { data, error } = await this.client.POST('/v1/logs', {
      headers: { Authorization: `Bearer ${token}` },
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
