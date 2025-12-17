export type ContributionType = 'commit' | 'issue' | 'pull_request' | 'pull_request_review';

export class Contribution {
  constructor(
    readonly date: Date,
    readonly count: number,
    readonly type: ContributionType,
  ) {}

  public static calculate(contributions: Contribution[]): Contribution[] {
    if (contributions.length === 0) {
      return [];
    }

    const contributionsByDateAndType = new Map<string, Map<ContributionType, number>>();

    for (const contribution of contributions) {
      const dateKey = contribution.date.toISOString().slice(0, 10);
      if (!contributionsByDateAndType.has(dateKey)) {
        contributionsByDateAndType.set(dateKey, new Map());
      }
      const typeMap = contributionsByDateAndType.get(dateKey)!;
      typeMap.set(contribution.type, (typeMap.get(contribution.type) ?? 0) + contribution.count);
    }

    const allTimes = contributions.map((c) => c.date.getTime());
    const minTime = Math.min(...allTimes);
    const maxTime = Math.max(...allTimes);

    const finalContributions: Contribution[] = [];
    let currentTime = minTime;
    while (currentTime <= maxTime) {
      const currentDate = new Date(currentTime);
      const dateKey = currentDate.toISOString().slice(0, 10);
      const typeMap = contributionsByDateAndType.get(dateKey);

      const types: ContributionType[] = ['commit', 'issue', 'pull_request', 'pull_request_review'];
      for (const type of types) {
        const count = typeMap?.get(type) ?? 0;
        finalContributions.push(new Contribution(currentDate, count, type));
      }

      const d = new Date(currentTime);
      d.setUTCDate(d.getUTCDate() + 1);
      currentTime = d.getTime();
    }

    return finalContributions;
  }
}
