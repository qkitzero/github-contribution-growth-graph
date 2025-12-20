import { gql, GraphQLClient } from 'graphql-request';
import {
  Contribution,
  CONTRIBUTION_TYPES,
  ContributionType,
} from '../../../domain/contribution/contribution';

const TOTAL_CONTRIBUTIONS_QUERY = gql`
  query ($userName: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $userName) {
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        totalIssueContributions
        totalPullRequestContributions
        totalPullRequestReviewContributions
      }
    }
  }
`;

type TotalContributionsResponse = {
  user: {
    contributionsCollection: {
      totalCommitContributions: number;
      totalIssueContributions: number;
      totalPullRequestContributions: number;
      totalPullRequestReviewContributions: number;
    };
  };
};

export interface Client {
  getTotalContributions(userName: string, from: string, to: string): Promise<Contribution[]>;
}

export class ClientImpl implements Client {
  private client: GraphQLClient;

  constructor(token?: string) {
    const githubToken = token || process.env.GITHUB_TOKEN;
    this.client = new GraphQLClient('https://api.github.com/graphql', {
      headers: {
        authorization: `Bearer ${githubToken}`,
      },
    });
  }

  async getTotalContributions(userName: string, from: string, to: string): Promise<Contribution[]> {
    const res = await this.client.request<TotalContributionsResponse>(TOTAL_CONTRIBUTIONS_QUERY, {
      userName,
      from,
      to,
    });
    const collection = res.user.contributionsCollection;

    const fromDate = new Date(from);
    const toDate = new Date(to);

    const contributionMapping: Array<{ count: number; type: ContributionType }> = [
      { count: collection.totalCommitContributions, type: CONTRIBUTION_TYPES.COMMIT },
      { count: collection.totalIssueContributions, type: CONTRIBUTION_TYPES.ISSUE },
      { count: collection.totalPullRequestContributions, type: CONTRIBUTION_TYPES.PR },
      { count: collection.totalPullRequestReviewContributions, type: CONTRIBUTION_TYPES.REVIEW },
    ];

    return contributionMapping.map(
      ({ count, type }) => new Contribution(fromDate, toDate, count, type),
    );
  }
}
