import { GraphData } from '../graph/graph';

export type Contribution = {
  date: string;
  count: number;
};

export type TotalContribution = {
  date: Date;
  total: number;
};

export class ContributionAggregator {
  private readonly contributions: Contribution[];

  constructor(contributions: Contribution[]) {
    this.contributions = this.sortByDate(contributions);
  }

  private sortByDate(contributions: Contribution[]): Contribution[] {
    return [...contributions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }

  getGraphData(): GraphData {
    const cumulativeContributions = this.contributions.reduce((acc, contribution) => {
      const total = (acc.length > 0 ? acc[acc.length - 1].total : 0) + contribution.count;
      acc.push({
        date: new Date(contribution.date),
        total,
      });
      return acc;
    }, [] as TotalContribution[]);

    const labels = cumulativeContributions.map((c) =>
      c.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    );

    const values = cumulativeContributions.map((c) => c.total);

    return { labels, values };
  }
}
