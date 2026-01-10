import { gql, GraphQLClient } from 'graphql-request';
import {
  Contribution,
  CONTRIBUTION_TYPES,
  ContributionType,
} from '../../../domain/contribution/contribution';
import { Language } from '../../../domain/language/language';

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
        pullRequestContributionsByRepository(maxRepositories: 100) {
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
        issueContributionsByRepository(maxRepositories: 100) {
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
        pullRequestReviewContributionsByRepository(maxRepositories: 100) {
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
  repository: Repository;
}[];

type LanguageContributionsResponse = {
  user: {
    contributionsCollection: {
      commitContributionsByRepository: ContributionsByRepository;
      pullRequestContributionsByRepository: ContributionsByRepository;
      issueContributionsByRepository: ContributionsByRepository;
      pullRequestReviewContributionsByRepository: ContributionsByRepository;
    };
  };
};

export interface Client {
  getTotalContributions(userName: string, from: string, to: string): Promise<Contribution[]>;
  getLanguageContributions(userName: string, from: string, to: string): Promise<Language[]>;
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
    const collection = res.user.contributionsCollection;

    const repositoryLanguages = new Map<string, LanguageEdge[]>();

    const processRepos = (contributionsByRepo: ContributionsByRepository) => {
      contributionsByRepo.forEach(({ repository }) => {
        if (!repositoryLanguages.has(repository.nameWithOwner)) {
          repositoryLanguages.set(repository.nameWithOwner, repository.languages.edges);
        }
      });
    };

    processRepos(collection.commitContributionsByRepository);
    processRepos(collection.pullRequestContributionsByRepository);
    processRepos(collection.issueContributionsByRepository);
    processRepos(collection.pullRequestReviewContributionsByRepository);

    const languageMap = new Map<string, { color: string; size: number }>();

    repositoryLanguages.forEach((edges) => {
      edges.forEach((edge) => {
        const { name, color } = edge.node;
        const { size } = edge;

        if (languageMap.has(name)) {
          const current = languageMap.get(name)!;
          languageMap.set(name, {
            color: current.color,
            size: current.size + size,
          });
        } else {
          languageMap.set(name, { color, size });
        }
      });
    });

    const languages: Language[] = Array.from(languageMap.entries()).map(
      ([name, { color, size }]) => new Language(new Date(from), new Date(to), name, color, size),
    );

    return languages;
  }
}
