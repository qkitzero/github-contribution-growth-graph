import { gql, GraphQLClient } from 'graphql-request';
import { Contribution } from '../../domain/contribution/contribution';

type GitHubContributionsResponse = {
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

const GITHUB_GRAPHQL_API_URL = 'https://api.github.com/graphql';

/**
 * GitHub GraphQL APIを使用してコントリビューションデータを取得するクラス
 */
export class GitHubContributionFetcher {
  private client: GraphQLClient;

  constructor(token?: string) {
    const githubToken = token || process.env.GITHUB_TOKEN;
    if (!githubToken) {
      throw new Error('GitHub token not found in environment variables.');
    }

    this.client = new GraphQLClient(GITHUB_GRAPHQL_API_URL, {
      headers: {
        authorization: `Bearer ${githubToken}`,
      },
    });
  }

  /**
   * 指定期間のコントリビューションを取得
   */
  async fetch(userName: string, from: string, to: string): Promise<Contribution[]> {
    const query = gql`
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

    const variables = {
      userName,
      from,
      to,
    };

    const data = await this.client.request<GitHubContributionsResponse>(query, variables);

    return this.transformResponse(data);
  }

  /**
   * GitHubのレスポンスをContribution配列に変換
   */
  private transformResponse(data: GitHubContributionsResponse): Contribution[] {
    return data.user.contributionsCollection.contributionCalendar.weeks.flatMap((week) =>
      week.contributionDays.map((day) => ({
        date: day.date,
        count: day.contributionCount,
      })),
    );
  }
}
