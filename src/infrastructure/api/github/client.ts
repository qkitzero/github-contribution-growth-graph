import { gql, GraphQLClient } from 'graphql-request';
import { Contribution, ContributionType } from '../../../domain/contribution/contribution';

const COMMIT_CONTRIBUTIONS_BY_REPOSITORY_QUERY = gql`
  query ($userName: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $userName) {
      contributionsCollection(from: $from, to: $to) {
        commitContributionsByRepository(maxRepositories: 100) {
          contributions(first: 100) {
            nodes {
              occurredAt
            }
          }
        }
      }
    }
  }
`;

const ISSUE_CONTRIBUTIONS_QUERY = gql`
  query ($userName: String!, $from: DateTime!, $to: DateTime!, $cursor: String) {
    user(login: $userName) {
      contributionsCollection(from: $from, to: $to) {
        issueContributions(first: 100, after: $cursor) {
          nodes {
            occurredAt
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  }
`;

const PULL_REQUEST_CONTRIBUTIONS_QUERY = gql`
  query ($userName: String!, $from: DateTime!, $to: DateTime!, $cursor: String) {
    user(login: $userName) {
      contributionsCollection(from: $from, to: $to) {
        pullRequestContributions(first: 100, after: $cursor) {
          nodes {
            occurredAt
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  }
`;

const PULL_REQUEST_REVIEW_CONTRIBUTIONS_QUERY = gql`
  query ($userName: String!, $from: DateTime!, $to: DateTime!, $cursor: String) {
    user(login: $userName) {
      contributionsCollection(from: $from, to: $to) {
        pullRequestReviewContributions(first: 100, after: $cursor) {
          nodes {
            occurredAt
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  }
`;

type PageInfo = {
  hasNextPage: boolean;
  endCursor: string | null;
};

async function fetchAllPages<T>(
  fetchPage: (cursor: string | null) => Promise<{ nodes: T[]; pageInfo: PageInfo }>,
  options: { delay: number } = { delay: 0 },
): Promise<T[]> {
  let cursor: string | null = null;
  const results: T[] = [];

  while (true) {
    const { nodes, pageInfo } = await fetchPage(cursor);
    results.push(...nodes);

    if (!pageInfo.hasNextPage) break;
    cursor = pageInfo.endCursor;

    if (options.delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, options.delay));
    }
  }

  return results;
}

export interface Client {
  getCommitContributionsByRepository(
    userName: string,
    from: string,
    to: string,
  ): Promise<Contribution[]>;
  getIssueContributions(userName: string, from: string, to: string): Promise<Contribution[]>;
  getPullRequestContributions(userName: string, from: string, to: string): Promise<Contribution[]>;
  getPullRequestReviewContributions(
    userName: string,
    from: string,
    to: string,
  ): Promise<Contribution[]>;
}

type ContributionConnection = {
  nodes: { occurredAt: string }[];
  pageInfo: PageInfo;
};

type PaginatedContributionResponse = {
  user: {
    contributionsCollection: {
      [key: string]: ContributionConnection;
    };
  };
};

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

  private async fetchContributions(
    userName: string,
    from: string,
    to: string,
    query: string,
    contributionType: ContributionType,
    responseKey: string,
  ): Promise<Contribution[]> {
    const dates = await fetchAllPages<Date>(
      async (cursor) => {
        const res = await this.client.request<PaginatedContributionResponse>(query, {
          userName,
          from,
          to,
          cursor,
        });

        const conn = res.user.contributionsCollection[responseKey];

        return {
          nodes: conn.nodes
            .filter((n): n is NonNullable<typeof n> => n !== null)
            .map((n) => new Date(n.occurredAt)),
          pageInfo: conn.pageInfo,
        };
      },
      { delay: this.requestDelay },
    );

    const countsByDate = new Map<string, number>();
    for (const date of dates) {
      const key = date.toISOString().slice(0, 10);
      countsByDate.set(key, (countsByDate.get(key) ?? 0) + 1);
    }

    return Array.from(countsByDate.entries()).map(
      ([date, count]) => new Contribution(new Date(date), count, contributionType),
    );
  }

  async getCommitContributionsByRepository(
    userName: string,
    from: string,
    to: string,
  ): Promise<Contribution[]> {
    type Response = {
      user: {
        contributionsCollection: {
          commitContributionsByRepository: {
            contributions: {
              nodes: {
                occurredAt: string;
              }[];
            };
          }[];
        };
      };
    };

    const res = await this.client.request<Response>(COMMIT_CONTRIBUTIONS_BY_REPOSITORY_QUERY, {
      userName,
      from,
      to,
    });

    const contributions = res.user.contributionsCollection.commitContributionsByRepository.flatMap(
      (repo) => repo.contributions.nodes,
    );

    const dates = contributions
      .filter((n): n is NonNullable<typeof n> => n !== null)
      .map((n) => new Date(n.occurredAt));

    const countsByDate = new Map<string, number>();
    for (const date of dates) {
      const key = date.toISOString().slice(0, 10);
      countsByDate.set(key, (countsByDate.get(key) ?? 0) + 1);
    }

    return Array.from(countsByDate.entries()).map(
      ([date, count]) => new Contribution(new Date(date), count, 'commit'),
    );
  }

  async getIssueContributions(userName: string, from: string, to: string): Promise<Contribution[]> {
    return this.fetchContributions(
      userName,
      from,
      to,
      ISSUE_CONTRIBUTIONS_QUERY,
      'issue',
      'issueContributions',
    );
  }

  async getPullRequestContributions(
    userName: string,
    from: string,
    to: string,
  ): Promise<Contribution[]> {
    return this.fetchContributions(
      userName,
      from,
      to,
      PULL_REQUEST_CONTRIBUTIONS_QUERY,
      'pull_request',
      'pullRequestContributions',
    );
  }

  async getPullRequestReviewContributions(
    userName: string,
    from: string,
    to: string,
  ): Promise<Contribution[]> {
    return this.fetchContributions(
      userName,
      from,
      to,
      PULL_REQUEST_REVIEW_CONTRIBUTIONS_QUERY,
      'pull_request_review',
      'pullRequestReviewContributions',
    );
  }
}
