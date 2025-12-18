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

type DateRange = {
  from: string;
  to: string;
};

export class GraphUseCaseImpl implements GraphUseCase {
  constructor(private readonly githubClient: GitHubClient) {}

  async createGraph(
    user: string,
    from?: string,
    to?: string,
    theme?: string,
    size?: string,
  ): Promise<Buffer> {
    const { fromDate, toDate } = this.calculateDateRange(from, to);
    const monthlyRanges = this.generateMonthlyRanges(fromDate, toDate);
    const contributions = await this.fetchAllContributions(user, monthlyRanges);

    const graph = new Graph(theme, size);
    return graph.generate(contributions);
  }

  private calculateDateRange(from?: string, to?: string): { fromDate: Date; toDate: Date } {
    const now = new Date();
    const toDate = to
      ? new Date(to + 'T00:00:00Z')
      : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const fromDate = from
      ? new Date(from + 'T00:00:00Z')
      : new Date(Date.UTC(toDate.getUTCFullYear() - 1, toDate.getUTCMonth(), toDate.getUTCDate()));

    return { fromDate, toDate };
  }

  private generateMonthlyRanges(fromDate: Date, toDate: Date): DateRange[] {
    const ranges: DateRange[] = [];
    let currentDate = fromDate;

    while (currentDate < toDate) {
      const nextMonth = new Date(currentDate);
      nextMonth.setUTCMonth(currentDate.getUTCMonth() + 1);

      const rangeEnd = nextMonth < toDate ? nextMonth : toDate;

      ranges.push({
        from: currentDate.toISOString(),
        to: rangeEnd.toISOString(),
      });

      currentDate = nextMonth;
    }

    return ranges;
  }

  private async fetchAllContributions(user: string, ranges: DateRange[]): Promise<Contribution[]> {
    const promises = ranges.map((range) =>
      this.githubClient.getTotalContributions(user, range.from, range.to),
    );

    const results = await Promise.all(promises);
    return results.flat();
  }
}
