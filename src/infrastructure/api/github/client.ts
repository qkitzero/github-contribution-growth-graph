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

export interface Client {
  getContributions(userName: string, from: string, to: string): Promise<Contribution[]>;
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

  async getContributions(userName: string, from: string, to: string): Promise<Contribution[]> {
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
          week.contributionDays.map(
            (day) => new Contribution(new Date(day.date), day.contributionCount),
          ),
      );

    return contributions;
  }
}
