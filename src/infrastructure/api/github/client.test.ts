import { GitHubError } from '../../../application/errors';
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
    const mockInstance = (GraphQLClient as jest.Mock).mock.results[
      (GraphQLClient as jest.Mock).mock.results.length - 1
    ].value as { request: jest.Mock };
    const mockRequest = mockInstance.request;
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
    const createTotalContributionsResponse = (
      commits: Array<{ totalCount: number; isPrivate: boolean }> = [],
      issues: Array<{ totalCount: number; isPrivate: boolean }> = [],
      prs: Array<{ totalCount: number; isPrivate: boolean }> = [],
      reviews: Array<{ totalCount: number; isPrivate: boolean }> = [],
    ) => ({
      user: {
        contributionsCollection: {
          commitContributionsByRepository: commits.map((c) => ({
            contributions: { totalCount: c.totalCount },
            repository: { isPrivate: c.isPrivate },
          })),
          issueContributionsByRepository: issues.map((c) => ({
            contributions: { totalCount: c.totalCount },
            repository: { isPrivate: c.isPrivate },
          })),
          pullRequestContributionsByRepository: prs.map((c) => ({
            contributions: { totalCount: c.totalCount },
            repository: { isPrivate: c.isPrivate },
          })),
          pullRequestReviewContributionsByRepository: reviews.map((c) => ({
            contributions: { totalCount: c.totalCount },
            repository: { isPrivate: c.isPrivate },
          })),
        },
      },
    });

    it('should return 4 contributions mapped correctly', async () => {
      const { githubClient, mockRequest } = setup();

      mockRequest.mockResolvedValue(
        createTotalContributionsResponse(
          [{ totalCount: 100, isPrivate: false }],
          [{ totalCount: 20, isPrivate: false }],
          [{ totalCount: 30, isPrivate: false }],
          [{ totalCount: 15, isPrivate: false }],
        ),
      );

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

    it('should exclude private repository contributions', async () => {
      const { githubClient, mockRequest } = setup();

      mockRequest.mockResolvedValue(
        createTotalContributionsResponse(
          [
            { totalCount: 80, isPrivate: false },
            { totalCount: 20, isPrivate: true },
          ],
          [
            { totalCount: 10, isPrivate: false },
            { totalCount: 10, isPrivate: true },
          ],
          [
            { totalCount: 25, isPrivate: false },
            { totalCount: 5, isPrivate: true },
          ],
          [
            { totalCount: 12, isPrivate: false },
            { totalCount: 3, isPrivate: true },
          ],
        ),
      );

      const result = await githubClient.getTotalContributions(
        'testuser',
        '2025-01-01',
        '2025-12-31',
      );

      expect(result).toHaveLength(4);
      expect(result[0].totalCount).toBe(80);
      expect(result[1].totalCount).toBe(10);
      expect(result[2].totalCount).toBe(25);
      expect(result[3].totalCount).toBe(12);
    });

    it('should return 4 contributions with zero counts', async () => {
      const { githubClient, mockRequest } = setup();

      mockRequest.mockResolvedValue(createTotalContributionsResponse());

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

    it('should propagate GraphQL errors as GitHubError', async () => {
      const { githubClient, mockRequest } = setup();

      mockRequest.mockRejectedValue(new Error('GraphQL error'));

      await expect(
        githubClient.getTotalContributions('testuser', '2025-01-01', '2025-12-31'),
      ).rejects.toThrow(GitHubError);
      await expect(
        githubClient.getTotalContributions('testuser', '2025-01-01', '2025-12-31'),
      ).rejects.toThrow('GraphQL error');
    });
  });

  describe('getLanguageContributions', () => {
    const createRepoContribution = (
      nameWithOwner: string,
      commitCount: number,
      languages: Array<{ name: string; color: string; size: number }>,
      isPrivate = false,
    ) => ({
      contributions: { totalCount: commitCount },
      repository: {
        isPrivate,
        nameWithOwner,
        languages: {
          edges: languages.map((lang) => ({
            size: lang.size,
            node: { name: lang.name, color: lang.color },
          })),
        },
      },
    });

    const createResponse = (commitContribs: ReturnType<typeof createRepoContribution>[] = []) => ({
      user: {
        contributionsCollection: {
          commitContributionsByRepository: commitContribs,
        },
      },
    });

    it('should return weighted score for a single repository with a single language', async () => {
      const { githubClient, mockRequest } = setup();

      mockRequest.mockResolvedValue(
        createResponse([
          createRepoContribution('user/repo', 10, [
            { name: 'TypeScript', color: '#3178c6', size: 5000 },
          ]),
        ]),
      );

      const result = await githubClient.getLanguageContributions(
        'testuser',
        '2025-01-01',
        '2025-12-31',
      );

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('TypeScript');
      expect(result[0].color).toBe('#3178c6');
      expect(result[0].size).toBe(10.0);
    });

    it('should distribute commits proportionally across multiple languages', async () => {
      const { githubClient, mockRequest } = setup();

      mockRequest.mockResolvedValue(
        createResponse([
          createRepoContribution('user/repo', 10, [
            { name: 'TypeScript', color: '#3178c6', size: 7500 },
            { name: 'JavaScript', color: '#f1e05a', size: 2500 },
          ]),
        ]),
      );

      const result = await githubClient.getLanguageContributions(
        'testuser',
        '2025-01-01',
        '2025-12-31',
      );

      expect(result).toHaveLength(2);

      const ts = result.find((l) => l.name === 'TypeScript');
      const js = result.find((l) => l.name === 'JavaScript');

      expect(ts?.size).toBe(7.5);
      expect(js?.size).toBe(2.5);
    });

    it('should aggregate weighted scores across multiple repositories', async () => {
      const { githubClient, mockRequest } = setup();

      mockRequest.mockResolvedValue(
        createResponse([
          createRepoContribution('user/repo1', 10, [
            { name: 'TypeScript', color: '#3178c6', size: 7500 },
            { name: 'JavaScript', color: '#f1e05a', size: 2500 },
          ]),
          createRepoContribution('user/repo2', 20, [
            { name: 'TypeScript', color: '#3178c6', size: 6000 },
            { name: 'Python', color: '#3572A5', size: 4000 },
          ]),
        ]),
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

      expect(ts?.size).toBe(19.5);
      expect(js?.size).toBe(2.5);
      expect(py?.size).toBe(8.0);
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

    it('should skip repository with no language edges', async () => {
      const { githubClient, mockRequest } = setup();

      mockRequest.mockResolvedValue(createResponse([createRepoContribution('user/repo', 10, [])]));

      const result = await githubClient.getLanguageContributions(
        'testuser',
        '2025-01-01',
        '2025-12-31',
      );

      expect(result).toEqual([]);
    });

    it('should exclude private repository contributions', async () => {
      const { githubClient, mockRequest } = setup();

      mockRequest.mockResolvedValue(
        createResponse([
          createRepoContribution('user/public-repo', 10, [
            { name: 'TypeScript', color: '#3178c6', size: 5000 },
          ]),
          createRepoContribution(
            'user/private-repo',
            20,
            [{ name: 'Python', color: '#3572A5', size: 3000 }],
            true,
          ),
        ]),
      );

      const result = await githubClient.getLanguageContributions(
        'testuser',
        '2025-01-01',
        '2025-12-31',
      );

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('TypeScript');
      expect(result[0].size).toBe(10.0);
    });

    it('should skip repository with zero commits', async () => {
      const { githubClient, mockRequest } = setup();

      mockRequest.mockResolvedValue(
        createResponse([
          createRepoContribution('user/repo', 0, [
            { name: 'TypeScript', color: '#3178c6', size: 5000 },
          ]),
        ]),
      );

      const result = await githubClient.getLanguageContributions(
        'testuser',
        '2025-01-01',
        '2025-12-31',
      );

      expect(result).toEqual([]);
    });

    it('should propagate GraphQL errors as GitHubError', async () => {
      const { githubClient, mockRequest } = setup();

      mockRequest.mockRejectedValue(new Error('GraphQL error'));

      await expect(
        githubClient.getLanguageContributions('testuser', '2025-01-01', '2025-12-31'),
      ).rejects.toThrow(GitHubError);
      await expect(
        githubClient.getLanguageContributions('testuser', '2025-01-01', '2025-12-31'),
      ).rejects.toThrow('GraphQL error');
    });
  });
});
