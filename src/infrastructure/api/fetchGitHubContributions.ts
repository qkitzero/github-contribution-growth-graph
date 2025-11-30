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

export const fetchGitHubContributions = async (
  userName: string,
  from: string,
  to: string,
): Promise<Contribution[]> => {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GitHub token not found in environment variables.');
  }

  const client = new GraphQLClient(GITHUB_GRAPHQL_API_URL, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

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

  const data = await client.request<GitHubContributionsResponse>(query, variables);

  const contributions: Contribution[] =
    data.user.contributionsCollection.contributionCalendar.weeks.flatMap((week) =>
      week.contributionDays.map((day) => ({
        date: day.date,
        count: day.contributionCount,
      })),
    );

  return contributions;
};
