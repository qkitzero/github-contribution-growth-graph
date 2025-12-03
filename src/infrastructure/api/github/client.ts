import { gql, GraphQLClient } from 'graphql-request';
import { Contribution } from '../../../domain/contribution/contribution';

type ContributionsResponse = {
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

export class Client {
  private client: GraphQLClient;

  constructor(token?: string) {
    const githubToken = token || process.env.GITHUB_TOKEN;
    this.client = new GraphQLClient('https://api.github.com/graphql', {
      headers: {
        authorization: `Bearer ${githubToken}`,
      },
    });
  }

  async GetContributions(userName: string, from: string, to: string): Promise<Contribution[]> {
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

    const contributionsResponse = await this.client.request<ContributionsResponse>(
      query,
      variables,
    );

    const contributions =
      contributionsResponse.user.contributionsCollection.contributionCalendar.weeks.flatMap(
        (week) =>
          week.contributionDays.map((day) => ({
            date: day.date,
            count: day.contributionCount,
          })),
      );

    return contributions;
  }
}
