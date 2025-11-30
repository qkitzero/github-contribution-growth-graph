import { Contribution } from '../domain/contribution/contribution';
import { fetchGitHubContributions } from '../infrastructure/api/fetchGitHubContributions';

export interface GraphUseCase {
  createGraph(user: string): Promise<Contribution[]>;
}

export class GraphUseCaseImpl implements GraphUseCase {
  constructor() {}

  async createGraph(user: string): Promise<Contribution[]> {
    const to = new Date();
    const from = new Date();
    from.setFullYear(to.getFullYear() - 1);

    const contributions = await fetchGitHubContributions(
      user,
      from.toISOString(),
      to.toISOString(),
    );

    return contributions;
  }
}
