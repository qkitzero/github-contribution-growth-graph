import { Period } from '../graph/period';

export type ContributionType = 'commit' | 'issue' | 'pull_request' | 'pull_request_review';

export class Contribution {
  constructor(
    readonly from: Date,
    readonly to: Date,
    readonly totalCount: number,
    readonly type: ContributionType,
  ) {}
}

export type PeriodData = Map<string, number>;
export type AggregatedContributions = Map<ContributionType, PeriodData>;

export class Contributions {
  private static readonly TYPE_ORDER: readonly ContributionType[] = [
    'commit',
    'issue',
    'pull_request',
    'pull_request_review',
  ] as const;

  constructor(private readonly items: Contribution[]) {}

  get isEmpty(): boolean {
    return this.items.length === 0;
  }

  aggregate(): AggregatedContributions {
    const byTypeAndPeriod = new Map<ContributionType, PeriodData>();

    for (const contribution of this.items) {
      const period = Period.fromDate(contribution.from);
      const periodKey = period.toString();

      if (!byTypeAndPeriod.has(contribution.type)) {
        byTypeAndPeriod.set(contribution.type, new Map());
      }

      const periodData = byTypeAndPeriod.get(contribution.type)!;
      const currentTotal = periodData.get(periodKey) || 0;
      periodData.set(periodKey, currentTotal + contribution.totalCount);
    }

    return byTypeAndPeriod;
  }

  getAllPeriods(aggregated: AggregatedContributions): string[] {
    const allPeriods = new Set<string>();

    for (const periodData of aggregated.values()) {
      for (const period of periodData.keys()) {
        allPeriods.add(period);
      }
    }

    return Array.from(allPeriods).sort();
  }

  calculateCumulative(periodData: PeriodData, periods: string[]): number[] {
    let cumulative = 0;
    return periods.map((period) => {
      cumulative += periodData.get(period) || 0;
      return cumulative;
    });
  }

  getOrderedTypes(aggregated: AggregatedContributions): ContributionType[] {
    return Contributions.TYPE_ORDER.filter((type) => aggregated.has(type));
  }
}
