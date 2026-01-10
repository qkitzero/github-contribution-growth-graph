import { Contribution } from '../domain/contribution/contribution';
import { Graph } from '../domain/graph/graph';
import { Language } from '../domain/language/language';
import { Client as GitHubClient } from '../infrastructure/api/github/client';

export interface GraphUseCase {
  createContributionsGraph(
    user: string,
    from?: string,
    to?: string,
    theme?: string,
    size?: string,
    types?: string,
  ): Promise<Buffer>;
  createLanguagesGraph(user: string, from?: string, to?: string, size?: string): Promise<Buffer>;
}

type DateRange = {
  from: string;
  to: string;
};

export class GraphUseCaseImpl implements GraphUseCase {
  constructor(private readonly githubClient: GitHubClient) {}

  async createContributionsGraph(
    user: string,
    from?: string,
    to?: string,
    theme?: string,
    size?: string,
    types?: string,
  ): Promise<Buffer> {
    const { fromDate, toDate } = this.calculateDateRange(from, to);
    const monthlyRanges = this.generateMonthlyRanges(fromDate, toDate);
    const allContributions = await this.fetchAllContributions(user, monthlyRanges);

    const contributions = this.filterContributionsByTypes(allContributions, types);

    const graph = new Graph(theme, size);

    return graph.generate(contributions);
  }

  async createLanguagesGraph(
    user: string,
    from?: string,
    to?: string,
    size?: string,
  ): Promise<Buffer> {
    const { fromDate, toDate } = this.calculateDateRange(from, to);
    const monthlyRanges = this.generateMonthlyRanges(fromDate, toDate);
    const allLanguages = await this.fetchAllLanguages(user, monthlyRanges);

    const graph = new Graph(undefined, size);

    return graph.generateFromLanguages(allLanguages);
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

  private async fetchAll<T>(
    fetcher: (user: string, from: string, to: string) => Promise<T[]>,
    user: string,
    ranges: DateRange[],
  ): Promise<T[]> {
    const promises = ranges.map((range) => fetcher(user, range.from, range.to));
    const results = await Promise.all(promises);
    return results.flat();
  }

  private async fetchAllContributions(user: string, ranges: DateRange[]): Promise<Contribution[]> {
    return this.fetchAll(
      this.githubClient.getTotalContributions.bind(this.githubClient),
      user,
      ranges,
    );
  }

  private async fetchAllLanguages(user: string, ranges: DateRange[]): Promise<Language[]> {
    return this.fetchAll(
      this.githubClient.getLanguageContributions.bind(this.githubClient),
      user,
      ranges,
    );
  }

  private filterContributionsByTypes(
    contributions: Contribution[],
    types?: string,
  ): Contribution[] {
    if (!types) {
      return contributions;
    }

    const allowedTypes = types.split(',').map((type) => type.trim().toLowerCase());
    return contributions.filter((contribution) => allowedTypes.includes(contribution.type));
  }
}
