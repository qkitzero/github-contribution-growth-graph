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

      promises.push(this.githubClient.getContributionCalendar(user, startISO, endISO));
      promises.push(this.githubClient.getIssueContributions(user, startISO, endISO));
      promises.push(this.githubClient.getPullRequestContributions(user, startISO, endISO));
      promises.push(this.githubClient.getPullRequestReviewContributions(user, startISO, endISO));
      promises.push(this.githubClient.getRepositoryContributions(user, startISO, endISO));

      cursor = next;
    }

    const contributions = (await Promise.all(promises)).flat();

    const contributionsByDateAndType = new Map<string, Map<string, number>>();

    for (const contribution of contributions) {
      const dateKey = contribution.date.toISOString().slice(0, 10);
      if (!contributionsByDateAndType.has(dateKey)) {
        contributionsByDateAndType.set(dateKey, new Map());
      }
      contributionsByDateAndType.get(dateKey)!.set(contribution.type, contribution.count);
    }

    const finalContributions: Contribution[] = [];

    for (const [dateKey, typeMap] of contributionsByDateAndType.entries()) {
      const calendarCount = typeMap.get('calendar') ?? 0;
      const issueCount = typeMap.get('issue') ?? 0;
      const prCount = typeMap.get('pull_request') ?? 0;
      const prReviewCount = typeMap.get('pull_request_review') ?? 0;
      const repositoryCount = typeMap.get('repository') ?? 0;

      const commitCount = Math.max(
        0,
        calendarCount - issueCount - prCount - prReviewCount - repositoryCount,
      );

      const date = new Date(dateKey);

      if (commitCount > 0) {
        finalContributions.push(new Contribution(date, commitCount, 'commit'));
      }
      if (issueCount > 0) {
        finalContributions.push(new Contribution(date, issueCount, 'issue'));
      }
      if (prCount > 0) {
        finalContributions.push(new Contribution(date, prCount, 'pull_request'));
      }
      if (prReviewCount > 0) {
        finalContributions.push(new Contribution(date, prReviewCount, 'pull_request_review'));
      }
      if (repositoryCount > 0) {
        finalContributions.push(new Contribution(date, repositoryCount, 'repository'));
      }
    }

    const graph = new Graph(theme, size);

    return graph.generate(finalContributions);
  }
}
