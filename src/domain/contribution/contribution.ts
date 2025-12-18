export type ContributionType = 'commit' | 'issue' | 'pull_request' | 'pull_request_review';

export class Contribution {
  constructor(
    readonly from: Date,
    readonly to: Date,
    readonly totalCount: number,
    readonly type: ContributionType,
  ) {}
}
