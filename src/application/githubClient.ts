import { Contribution } from '../domain/contribution/contribution';
import { Language } from '../domain/language/language';

export interface GitHubClient {
  getTotalContributions(userName: string, from: string, to: string): Promise<Contribution[]>;
  getLanguageContributions(userName: string, from: string, to: string): Promise<Language[]>;
}
