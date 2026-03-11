import createClient from 'openapi-fetch';
import { AuthService } from '../../../application/authService';
import { AuthError } from '../../../application/errors';
import { paths } from './schema';

export class AuthServiceImpl implements AuthService {
  constructor(
    private readonly client: ReturnType<typeof createClient<paths>>,
    private readonly clientId: string,
    private readonly clientSecret: string,
  ) {}

  async getM2MToken(): Promise<string> {
    const { data, error } = await this.client.POST('/v1/m2m-token', {
      body: {
        clientId: this.clientId,
        clientSecret: this.clientSecret,
      },
    });

    if (error) {
      throw new AuthError(error.message || 'Failed to get m2m token');
    }

    if (!data.accessToken) {
      throw new AuthError('Access token is missing');
    }

    return data.accessToken;
  }
}
