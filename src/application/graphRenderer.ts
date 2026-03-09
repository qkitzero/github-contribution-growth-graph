import { Contribution } from '../domain/contribution/contribution';
import { Language } from '../domain/language/language';

export interface GraphRenderer {
  renderContributions(
    contributions: Contribution[],
    theme?: string,
    size?: string,
  ): Promise<Buffer>;
  renderLanguages(languages: Language[], theme?: string, size?: string): Promise<Buffer>;
}
