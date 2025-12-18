import { gql, GraphQLClient } from 'graphql-request';
import { Contribution } from '../../../domain/contribution/contribution';

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
  private readonly requestDelay: number;

  constructor(token?: string, requestDelay: number = 0) {
    const githubToken = token || process.env.GITHUB_TOKEN;
    this.client = new GraphQLClient('https://api.github.com/graphql', {
      headers: {
        authorization: `Bearer ${githubToken}`,
      },
    });
    this.requestDelay = requestDelay;
  }

  async getTotalContributions(userName: string, from: string, to: string): Promise<Contribution[]> {
    if (this.requestDelay > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.requestDelay));
    }

    const res = await this.client.request<TotalContributionsResponse>(TOTAL_CONTRIBUTIONS_QUERY, {
      userName,
      from,
      to,
    });
    const {
      totalCommitContributions,
      totalIssueContributions,
      totalPullRequestContributions,
      totalPullRequestReviewContributions,
    } = res.user.contributionsCollection;

    const fromDate = new Date(from);
    const toDate = new Date(to);
    return [
      new Contribution(fromDate, toDate, totalCommitContributions, 'commit'),
      new Contribution(fromDate, toDate, totalIssueContributions, 'issue'),
      new Contribution(fromDate, toDate, totalPullRequestContributions, 'pull_request'),
      new Contribution(fromDate, toDate, totalPullRequestReviewContributions, 'pull_request_review'),
    ];
  }
}
