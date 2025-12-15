import { gql, GraphQLClient } from 'graphql-request';
import { Contribution } from '../../../domain/contribution/contribution';

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

type IssueContributionsResponse = {
  user: {
    contributionsCollection: {
      issueContributions: {
        nodes: {
          occurredAt: string;
        }[];
        pageInfo: {
          hasNextPage: boolean;
          endCursor: string | null;
        };
      };
    };
  };
};

type PullRequestContributionsResponse = {
  user: {
    contributionsCollection: {
      pullRequestContributions: {
        nodes: {
          occurredAt: string;
        }[];
        pageInfo: {
          hasNextPage: boolean;
          endCursor: string | null;
        };
      };
    };
  };
};

type PullRequestReviewContributionsResponse = {
  user: {
    contributionsCollection: {
      pullRequestReviewContributions: {
        nodes: {
          occurredAt: string;
        }[];
        pageInfo: {
          hasNextPage: boolean;
          endCursor: string | null;
        };
      };
    };
  };
};

type RepositoryContributionsResponse = {
  user: {
    contributionsCollection: {
      repositoryContributions: {
        nodes: {
          occurredAt: string;
        }[];
        pageInfo: {
          hasNextPage: boolean;
          endCursor: string | null;
        };
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

function processContributions(
  dates: Date[],
  from: string,
  to: string,
  type: string,
): Contribution[] {
  const countsByDate = new Map<string, number>();

  for (const date of dates) {
    const key = date.toISOString().slice(0, 10);
    countsByDate.set(key, (countsByDate.get(key) ?? 0) + 1);
  }

  const results: Contribution[] = [];

  const current = new Date(from);
  const end = new Date(to);

  current.setUTCHours(0, 0, 0, 0);
  end.setUTCHours(0, 0, 0, 0);

  while (current <= end) {
    const key = current.toISOString().slice(0, 10);
    const count = countsByDate.get(key) ?? 0;

    results.push(new Contribution(new Date(key), count, type));

    current.setUTCDate(current.getUTCDate() + 1);
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

  async getIssueContributions(userName: string, from: string, to: string): Promise<Contribution[]> {
    const dates = await fetchAllPages<Date>(async (cursor) => {
      const res = await this.client.request<IssueContributionsResponse>(ISSUE_CONTRIBUTIONS_QUERY, {
        userName,
        from,
        to,
        cursor,
      });

      const conn = res.user.contributionsCollection.issueContributions;

      return {
        nodes: conn.nodes
          .filter((n): n is NonNullable<typeof n> => n !== null)
          .map((n) => new Date(n.occurredAt)),
        pageInfo: conn.pageInfo,
      };
    });

    return processContributions(dates, from, to, 'issue');
  }

  async getPullRequestContributions(
    userName: string,
    from: string,
    to: string,
  ): Promise<Contribution[]> {
    const dates = await fetchAllPages<Date>(async (cursor) => {
      const res = await this.client.request<PullRequestContributionsResponse>(
        PULL_REQUEST_CONTRIBUTIONS_QUERY,
        {
          userName,
          from,
          to,
          cursor,
        },
      );

      const conn = res.user.contributionsCollection.pullRequestContributions;

      return {
        nodes: conn.nodes
          .filter((n): n is NonNullable<typeof n> => n !== null)
          .map((n) => new Date(n.occurredAt)),
        pageInfo: conn.pageInfo,
      };
    });

    return processContributions(dates, from, to, 'pull_request');
  }

  async getPullRequestReviewContributions(
    userName: string,
    from: string,
    to: string,
  ): Promise<Contribution[]> {
    const dates = await fetchAllPages<Date>(async (cursor) => {
      const res = await this.client.request<PullRequestReviewContributionsResponse>(
        PULL_REQUEST_REVIEW_CONTRIBUTIONS_QUERY,
        {
          userName,
          from,
          to,
          cursor,
        },
      );

      const conn = res.user.contributionsCollection.pullRequestReviewContributions;

      return {
        nodes: conn.nodes
          .filter((n): n is NonNullable<typeof n> => n !== null)
          .map((n) => new Date(n.occurredAt)),
        pageInfo: conn.pageInfo,
      };
    });

    return processContributions(dates, from, to, 'pull_request_review');
  }

  async getRepositoryContributions(
    userName: string,
    from: string,
    to: string,
  ): Promise<Contribution[]> {
    const dates = await fetchAllPages<Date>(async (cursor) => {
      const res = await this.client.request<RepositoryContributionsResponse>(
        REPOSITORY_CONTRIBUTIONS_QUERY,
        {
          userName,
          from,
          to,
          cursor,
        },
      );

      const conn = res.user.contributionsCollection.repositoryContributions;

      return {
        nodes: conn.nodes
          .filter((n): n is NonNullable<typeof n> => n !== null)
          .map((n) => new Date(n.occurredAt)),
        pageInfo: conn.pageInfo,
      };
    });

    return processContributions(dates, from, to, 'repository');
  }
}
