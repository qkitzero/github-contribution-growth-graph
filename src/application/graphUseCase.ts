import { Contribution, ContributionAggregator } from '../domain/contribution/contribution';
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
      : new Date(new Date(toDate).setFullYear(toDate.getFullYear() - 1));

    const promises: Promise<Contribution[]>[] = [];
    let currentDate = fromDate;

    while (currentDate < toDate) {
      const nextDate = new Date(currentDate);
      nextDate.setFullYear(currentDate.getFullYear() + 1);

      promises.push(
        this.githubClient.GetContributions(
          user,
          currentDate.toISOString(),
          (nextDate < toDate ? nextDate : toDate).toISOString(),
        ),
      );
      currentDate = nextDate;
    }

    const results = await Promise.all(promises);

    const contributions = results.flat();

    const contributionAggregator = new ContributionAggregator(contributions);

    const graphData = contributionAggregator.getGraphData();

    const graph = new Graph();

    return await graph.generate(graphData);
  }
}
