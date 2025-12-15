import { gql, GraphQLClient } from 'graphql-request';
import { Contribution, ContributionType } from '../../../domain/contribution/contribution';

type ContributionCalendarResponse = {
  user: {
    contributionsCollection: {
      contributionCalendar: {
        weeks: {
          contributionDays: {
            contributionCount: number;
            date: string;
          }[];
        }[];
      };
    };
  };
};


const CONTRIBUTION_CALENDAR_QUERY = gql`
  query ($userName: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $userName) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          weeks {
            contributionDays {
              contributionCount
              date
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

const REPOSITORY_CONTRIBUTIONS_QUERY = gql`
  query ($userName: String!, $from: DateTime!, $to: DateTime!, $cursor: String) {
    user(login: $userName) {
      contributionsCollection(from: $from, to: $to) {
        repositoryContributions(first: 100, after: $cursor) {
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
): Promise<T[]> {
  let cursor: string | null = null;
  const results: T[] = [];

  while (true) {
    const { nodes, pageInfo } = await fetchPage(cursor);
    results.push(...nodes);

    if (!pageInfo.hasNextPage) break;
    cursor = pageInfo.endCursor;
  }

  return results;
}

export interface Client {
  getContributionCalendar(userName: string, from: string, to: string): Promise<Contribution[]>;
  getIssueContributions(userName: string, from: string, to: string): Promise<Contribution[]>;
  getPullRequestContributions(userName: string, from: string, to: string): Promise<Contribution[]>;
  getPullRequestReviewContributions(
    userName: string,
    from: string,
    to: string,
  ): Promise<Contribution[]>;
  getRepositoryContributions(userName: string, from: string, to: string): Promise<Contribution[]>;
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

  constructor(token?: string) {
    const githubToken = token || process.env.GITHUB_TOKEN;
    this.client = new GraphQLClient('https://api.github.com/graphql', {
      headers: {
        authorization: `Bearer ${githubToken}`,
      },
    });
  }

  async getContributionCalendar(
    userName: string,
    from: string,
    to: string,
  ): Promise<Contribution[]> {
    const res = await this.client.request<ContributionCalendarResponse>(
      CONTRIBUTION_CALENDAR_QUERY,
      { userName, from, to },
    );

    return res.user.contributionsCollection.contributionCalendar.weeks.flatMap((week) =>
      week.contributionDays.map(
        (day) => new Contribution(new Date(day.date), day.contributionCount, 'calendar'),
      ),
    );
  }

  private async fetchContributions(
    userName: string,
    from: string,
    to: string,
    query: string,
    contributionType: ContributionType,
    responseKey: string,
  ): Promise<Contribution[]> {
    const dates = await fetchAllPages<Date>(async (cursor) => {
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
    });

    const countsByDate = new Map<string, number>();
    for (const date of dates) {
      const key = date.toISOString().slice(0, 10);
      countsByDate.set(key, (countsByDate.get(key) ?? 0) + 1);
    }

    return Array.from(countsByDate.entries()).map(
      ([date, count]) => new Contribution(new Date(date), count, contributionType),
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

  async getRepositoryContributions(
    userName: string,
    from: string,
    to: string,
  ): Promise<Contribution[]> {
    return this.fetchContributions(
      userName,
      from,
      to,
      REPOSITORY_CONTRIBUTIONS_QUERY,
      'repository',
      'repositoryContributions',
    );
  }
}

