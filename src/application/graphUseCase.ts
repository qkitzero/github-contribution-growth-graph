import { Contribution } from '../domain/contribution/contribution';
import { Graph } from '../domain/graph/graph';
import { Client as GitHubClient } from '../infrastructure/api/github/client';

export interface GraphUseCase {
  createGraph(
    user: string,
    from?: string,
    to?: string,
    theme?: string,
    size?: string,
  ): Promise<Buffer>;
}

export class GraphUseCaseImpl implements GraphUseCase {
  constructor(private readonly githubClient: GitHubClient) {}

  async createGraph(
    user: string,
    from?: string,
    to?: string,
    theme?: string,
    size?: string,
  ): Promise<Buffer> {
    const now = new Date();
    const toDate = to
      ? new Date(to + 'T00:00:00Z')
      : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const fromDate = from
      ? new Date(from + 'T00:00:00Z')
      : new Date(Date.UTC(toDate.getUTCFullYear() - 1, toDate.getUTCMonth(), toDate.getUTCDate()));

    const promises: Promise<Contribution[]>[] = [];
    let cursor = fromDate;

    while (cursor < toDate) {
      const next = new Date(cursor);
      next.setFullYear(cursor.getFullYear() + 1);

      const rangeEnd = next < toDate ? next : toDate;
      const startISO = cursor.toISOString();
      const endISO = rangeEnd.toISOString();

      promises.push(this.githubClient.getCommitContributionsByRepository(user, startISO, endISO));
      promises.push(this.githubClient.getIssueContributions(user, startISO, endISO));
      promises.push(this.githubClient.getPullRequestContributions(user, startISO, endISO));
      promises.push(this.githubClient.getPullRequestReviewContributions(user, startISO, endISO));

      cursor = next;
    }

    const contributions = (await Promise.all(promises)).flat();

    const finalContributions = Contribution.calculate(contributions);

    const graph = new Graph(theme, size);

    return graph.generate(finalContributions);
  }
}
