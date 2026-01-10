import { Period } from '../graph/period';

export class Language {
  constructor(
    readonly from: Date,
    readonly to: Date,
    readonly name: string,
    readonly color: string,
    readonly size: number,
  ) {}
}

export type PeriodData = Map<string, number>;
export type AggregatedLanguages = Map<string, { color: string; data: PeriodData }>;

export class Languages {
  constructor(private readonly items: Language[]) {}

  get isEmpty(): boolean {
    return this.items.length === 0;
  }

  aggregate(): AggregatedLanguages {
    const byLanguageAndPeriod = new Map<string, { color: string; data: PeriodData }>();

    for (const language of this.items) {
      const period = Period.fromDate(language.from);
      const periodKey = period.toString();

      if (!byLanguageAndPeriod.has(language.name)) {
        byLanguageAndPeriod.set(language.name, { color: language.color, data: new Map() });
      }

      const langData = byLanguageAndPeriod.get(language.name)!;
      const currentSize = langData.data.get(periodKey) || 0;
      langData.data.set(periodKey, currentSize + language.size);
    }
    return byLanguageAndPeriod;
  }

  getAllPeriods(aggregated: AggregatedLanguages): string[] {
    const allPeriods = new Set<string>();

    for (const langData of aggregated.values()) {
      for (const period of langData.data.keys()) {
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

  getOrderedLanguages(aggregated: AggregatedLanguages): string[] {
    return [...aggregated.entries()]
      .map(([name, langData]) => ({
        name,
        totalSize: [...langData.data.values()].reduce((sum, v) => sum + v, 0),
      }))
      .sort((a, b) => b.totalSize - a.totalSize)
      .map((item) => item.name);
  }
}
