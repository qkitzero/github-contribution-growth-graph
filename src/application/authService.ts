export interface AuthService {
  getM2MToken(): Promise<string>;
}
