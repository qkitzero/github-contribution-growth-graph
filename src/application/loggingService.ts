export interface LoggingService {
  createLog(serviceName: string, level: string, message: string): Promise<string>;
}
