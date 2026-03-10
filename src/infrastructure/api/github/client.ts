import { gql, GraphQLClient } from 'graphql-request';
import {
  Contribution,
  CONTRIBUTION_TYPES,
  ContributionType,
} from '../../../domain/contribution/contribution';
import { Language } from '../../../domain/language/language';
import { GitHubClient } from '../../../application/githubClient';

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

const LANGUAGE_CONTRIBUTIONS_QUERY = gql`
  query ($userName: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $userName) {
      contributionsCollection(from: $from, to: $to) {
        commitContributionsByRepository(maxRepositories: 100) {
          contributions {
            totalCount
          }
          repository {
            nameWithOwner
            languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
              edges {
                size
                node {
                  name
                  color
                }
              }
            }
          }
        }
      }
    }
  }
`;

type LanguageNode = {
  name: string;
  color: string;
};

type LanguageEdge = {
  size: number;
  node: LanguageNode;
};

type Repository = {
  nameWithOwner: string;
  languages: {
    edges: LanguageEdge[];
  };
};

type ContributionsByRepository = {
  contributions: { totalCount: number };
  repository: Repository;
}[];

type LanguageContributionsResponse = {
  user: {
    contributionsCollection: {
      commitContributionsByRepository: ContributionsByRepository;
    };
  };
};

export class GitHubClientImpl implements GitHubClient {
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

    const contributionMapping: Array<{ count: number; type: ContributionType }> = [
      { count: collection.totalCommitContributions, type: CONTRIBUTION_TYPES.COMMIT },
      { count: collection.totalIssueContributions, type: CONTRIBUTION_TYPES.ISSUE },
      { count: collection.totalPullRequestContributions, type: CONTRIBUTION_TYPES.PR },
      { count: collection.totalPullRequestReviewContributions, type: CONTRIBUTION_TYPES.REVIEW },
    ];

    return contributionMapping.map(
      ({ count, type }) => new Contribution(new Date(from), new Date(to), count, type),
    );
  }

  async getLanguageContributions(userName: string, from: string, to: string): Promise<Language[]> {
    const res = await this.client.request<LanguageContributionsResponse>(
      LANGUAGE_CONTRIBUTIONS_QUERY,
      {
        userName,
        from,
        to,
      },
    );
    const commitContribs = res.user.contributionsCollection.commitContributionsByRepository;

    const languageMap = new Map<string, { color: string; size: number }>();

    for (const entry of commitContribs) {
      const commitCount = entry.contributions.totalCount;
      const edges = entry.repository.languages.edges;
      const totalBytes = edges.reduce((sum, edge) => sum + edge.size, 0);
      if (totalBytes === 0 || commitCount === 0) continue;

      for (const edge of edges) {
        const { name, color } = edge.node;
        const proportion = edge.size / totalBytes;
        const weightedScore = commitCount * proportion;

        if (languageMap.has(name)) {
          const current = languageMap.get(name)!;
          languageMap.set(name, {
            color: current.color,
            size: current.size + weightedScore,
          });
        } else {
          languageMap.set(name, { color, size: weightedScore });
        }
      }
    }

    const languages: Language[] = Array.from(languageMap.entries()).map(
      ([name, { color, size }]) => new Language(new Date(from), new Date(to), name, color, size),
    );

    return languages;
  }
}
