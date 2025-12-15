export type ContributionType =
  | 'commit'
  | 'issue'
  | 'pull_request'
  | 'pull_request_review'
  | 'repository'
  | 'calendar';

export class Contribution {
  constructor(
    readonly date: Date,
    readonly count: number,
    readonly type: ContributionType,
  ) {}

  public static calculate(contributions: Contribution[]): Contribution[] {
    const contributionsByDateAndType = new Map<string, Map<ContributionType, number>>();

    for (const contribution of contributions) {
      const dateKey = contribution.date.toISOString().slice(0, 10);
      if (!contributionsByDateAndType.has(dateKey)) {
        contributionsByDateAndType.set(dateKey, new Map());
      }
      const typeMap = contributionsByDateAndType.get(dateKey)!;
      typeMap.set(contribution.type, (typeMap.get(contribution.type) ?? 0) + contribution.count);
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

    return finalContributions;
  }
}
