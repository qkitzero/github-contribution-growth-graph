import { CONTRIBUTION_TYPES } from '../../../domain/contribution/contribution';

jest.mock('graphql-request', () => ({
  GraphQLClient: jest.fn().mockImplementation(() => ({
    request: jest.fn(),
  })),
  gql: jest.fn((strings: TemplateStringsArray) => strings.join('')),
}));

import { GraphQLClient } from 'graphql-request';
import { GitHubClientImpl } from './client';

describe('GitHubClientImpl', () => {
  const setup = () => {
    const githubClient = new GitHubClientImpl('test-token');
    const mockRequest = (GraphQLClient as jest.Mock).mock.results[
      (GraphQLClient as jest.Mock).mock.results.length - 1
    ].value.request as jest.Mock;
    return { githubClient, mockRequest };
  };

  describe('constructor', () => {
    it('should create GraphQLClient with provided token', () => {
      new GitHubClientImpl('my-token');

      expect(GraphQLClient).toHaveBeenCalledWith('https://api.github.com/graphql', {
        headers: {
          authorization: 'Bearer my-token',
        },
      });
    });

    it('should fallback to GITHUB_TOKEN env variable when no token provided', () => {
      const originalEnv = process.env.GITHUB_TOKEN;
      process.env.GITHUB_TOKEN = 'env-token';

      new GitHubClientImpl();

      expect(GraphQLClient).toHaveBeenCalledWith('https://api.github.com/graphql', {
        headers: {
          authorization: 'Bearer env-token',
        },
      });

      process.env.GITHUB_TOKEN = originalEnv;
    });
  });

  describe('getTotalContributions', () => {
    it('should return 4 contributions mapped correctly', async () => {
      const { githubClient, mockRequest } = setup();

      mockRequest.mockResolvedValue({
        user: {
          contributionsCollection: {
            totalCommitContributions: 100,
            totalIssueContributions: 20,
            totalPullRequestContributions: 30,
            totalPullRequestReviewContributions: 15,
          },
        },
      });

      const result = await githubClient.getTotalContributions(
        'testuser',
        '2025-01-01',
        '2025-12-31',
      );

      expect(result).toHaveLength(4);
      expect(result[0].totalCount).toBe(100);
      expect(result[0].type).toBe(CONTRIBUTION_TYPES.COMMIT);
      expect(result[1].totalCount).toBe(20);
      expect(result[1].type).toBe(CONTRIBUTION_TYPES.ISSUE);
      expect(result[2].totalCount).toBe(30);
      expect(result[2].type).toBe(CONTRIBUTION_TYPES.PR);
      expect(result[3].totalCount).toBe(15);
      expect(result[3].type).toBe(CONTRIBUTION_TYPES.REVIEW);
    });

    it('should return 4 contributions with zero counts', async () => {
      const { githubClient, mockRequest } = setup();

      mockRequest.mockResolvedValue({
        user: {
          contributionsCollection: {
            totalCommitContributions: 0,
            totalIssueContributions: 0,
            totalPullRequestContributions: 0,
            totalPullRequestReviewContributions: 0,
          },
        },
      });

      const result = await githubClient.getTotalContributions(
        'testuser',
        '2025-01-01',
        '2025-12-31',
      );

      expect(result).toHaveLength(4);
      result.forEach((contribution) => {
        expect(contribution.totalCount).toBe(0);
      });
    });

    it('should propagate GraphQL errors', async () => {
      const { githubClient, mockRequest } = setup();

      mockRequest.mockRejectedValue(new Error('GraphQL error'));

      await expect(
        githubClient.getTotalContributions('testuser', '2025-01-01', '2025-12-31'),
      ).rejects.toThrow('GraphQL error');
    });
  });

  describe('getLanguageContributions', () => {
    const createRepoContribution = (
      nameWithOwner: string,
      languages: Array<{ name: string; color: string; size: number }>,
    ) => ({
      repository: {
        nameWithOwner,
        languages: {
          edges: languages.map((lang) => ({
            size: lang.size,
            node: { name: lang.name, color: lang.color },
          })),
        },
      },
    });

    const createResponse = (
      overrides: Partial<{
        commit: ReturnType<typeof createRepoContribution>[];
        pr: ReturnType<typeof createRepoContribution>[];
        issue: ReturnType<typeof createRepoContribution>[];
        review: ReturnType<typeof createRepoContribution>[];
      }> = {},
    ) => ({
      user: {
        contributionsCollection: {
          commitContributionsByRepository: overrides.commit ?? [],
          pullRequestContributionsByRepository: overrides.pr ?? [],
          issueContributionsByRepository: overrides.issue ?? [],
          pullRequestReviewContributionsByRepository: overrides.review ?? [],
        },
      },
    });

    it('should return languages for a single repository with a single language', async () => {
      const { githubClient, mockRequest } = setup();

      mockRequest.mockResolvedValue(
        createResponse({
          commit: [
            createRepoContribution('user/repo', [
              { name: 'TypeScript', color: '#3178c6', size: 5000 },
            ]),
          ],
        }),
      );

      const result = await githubClient.getLanguageContributions(
        'testuser',
        '2025-01-01',
        '2025-12-31',
      );

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('TypeScript');
      expect(result[0].color).toBe('#3178c6');
      expect(result[0].size).toBe(5000);
    });

    it('should deduplicate repositories across contribution types', async () => {
      const { githubClient, mockRequest } = setup();

      const repo = createRepoContribution('user/repo', [
        { name: 'TypeScript', color: '#3178c6', size: 5000 },
      ]);

      mockRequest.mockResolvedValue(createResponse({ commit: [repo], pr: [repo], issue: [repo] }));

      const result = await githubClient.getLanguageContributions(
        'testuser',
        '2025-01-01',
        '2025-12-31',
      );

      expect(result).toHaveLength(1);
      expect(result[0].size).toBe(5000);
    });

    it('should aggregate sizes for the same language across repositories', async () => {
      const { githubClient, mockRequest } = setup();

      mockRequest.mockResolvedValue(
        createResponse({
          commit: [
            createRepoContribution('user/repo1', [
              { name: 'TypeScript', color: '#3178c6', size: 3000 },
            ]),
            createRepoContribution('user/repo2', [
              { name: 'TypeScript', color: '#3178c6', size: 2000 },
            ]),
          ],
        }),
      );

      const result = await githubClient.getLanguageContributions(
        'testuser',
        '2025-01-01',
        '2025-12-31',
      );

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('TypeScript');
      expect(result[0].size).toBe(5000);
    });

    it('should handle multiple repositories with multiple languages', async () => {
      const { githubClient, mockRequest } = setup();

      mockRequest.mockResolvedValue(
        createResponse({
          commit: [
            createRepoContribution('user/repo1', [
              { name: 'TypeScript', color: '#3178c6', size: 3000 },
              { name: 'JavaScript', color: '#f1e05a', size: 1000 },
            ]),
            createRepoContribution('user/repo2', [
              { name: 'TypeScript', color: '#3178c6', size: 2000 },
              { name: 'Python', color: '#3572A5', size: 4000 },
            ]),
          ],
        }),
      );

      const result = await githubClient.getLanguageContributions(
        'testuser',
        '2025-01-01',
        '2025-12-31',
      );

      expect(result).toHaveLength(3);

      const ts = result.find((l) => l.name === 'TypeScript');
      const js = result.find((l) => l.name === 'JavaScript');
      const py = result.find((l) => l.name === 'Python');

      expect(ts?.size).toBe(5000);
      expect(js?.size).toBe(1000);
      expect(py?.size).toBe(4000);
    });

    it('should return empty array when no repositories exist', async () => {
      const { githubClient, mockRequest } = setup();

      mockRequest.mockResolvedValue(createResponse());

      const result = await githubClient.getLanguageContributions(
        'testuser',
        '2025-01-01',
        '2025-12-31',
      );

      expect(result).toEqual([]);
    });

    it('should return empty array when repository has no language edges', async () => {
      const { githubClient, mockRequest } = setup();

      mockRequest.mockResolvedValue(
        createResponse({
          commit: [createRepoContribution('user/repo', [])],
        }),
      );

      const result = await githubClient.getLanguageContributions(
        'testuser',
        '2025-01-01',
        '2025-12-31',
      );

      expect(result).toEqual([]);
    });

    it('should propagate GraphQL errors', async () => {
      const { githubClient, mockRequest } = setup();

      mockRequest.mockRejectedValue(new Error('GraphQL error'));

      await expect(
        githubClient.getLanguageContributions('testuser', '2025-01-01', '2025-12-31'),
      ).rejects.toThrow('GraphQL error');
    });
  });
});
