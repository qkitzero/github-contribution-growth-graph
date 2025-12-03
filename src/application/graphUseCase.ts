import { Contribution } from '../domain/contribution/contribution';
import { Graph } from '../domain/graph/graph';
import { Client as GitHubClient } from '../infrastructure/api/github/client';

export interface GraphUseCase {
  createGraph(user: string, from?: string, to?: string): Promise<Buffer>;
}

export class GraphUseCaseImpl implements GraphUseCase {
  constructor(private readonly githubClient: GitHubClient) {}

  async createGraph(user: string, from?: string, to?: string): Promise<Buffer> {
    const now = new Date();
    const toDate = to ? new Date(to) : now;
    const fromDate = from
      ? new Date(from)
      : new Date(toDate.getFullYear() - 1, toDate.getMonth(), toDate.getDate());

    const promises: Promise<Contribution[]>[] = [];
    let cursor = fromDate;

    while (cursor < toDate) {
      const next = new Date(cursor);
      next.setFullYear(cursor.getFullYear() + 1);

      const rangeEnd = next < toDate ? next : toDate;
      const startISO = cursor.toISOString();
      const endISO = rangeEnd.toISOString();

      promises.push(this.githubClient.getContributions(user, startISO, endISO));
      cursor = next;
    }

    const contributions = (await Promise.all(promises)).flat();

    return new Graph().generate(contributions);
  }
}
