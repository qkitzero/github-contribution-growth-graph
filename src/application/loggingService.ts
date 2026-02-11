export interface LoggingService {
  createLog(token: string, serviceName: string, level: string, message: string): Promise<string>;
}
