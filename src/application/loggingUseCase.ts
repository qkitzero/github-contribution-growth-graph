export interface LoggingUseCase {
  createLog(serviceName: string, level: string, message: string): Promise<string>;
}
