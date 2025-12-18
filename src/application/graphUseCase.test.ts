import { Contribution } from '../domain/contribution/contribution';
import { Client as GitHubClient } from '../infrastructure/api/github/client';
import { GraphUseCaseImpl } from './graphUseCase';

describe('GraphUseCase', () => {
  const setup = () => {
    const mockGitHubClient: jest.Mocked<GitHubClient> = {
      getTotalContributions: jest.fn(),
    };
    const graphUseCase = new GraphUseCaseImpl(mockGitHubClient);
    return { mockGitHubClient, graphUseCase };
  };

  describe('createContributionsGraph', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should create a graph with default dates', async () => {
      const { mockGitHubClient, graphUseCase } = setup();

      mockGitHubClient.getTotalContributions.mockResolvedValue([
        new Contribution(
          new Date('2024-01-01T00:00:00.000Z'),
          new Date('2024-02-01T00:00:00.000Z'),
          5,
          'commit',
        ),
        new Contribution(
          new Date('2024-01-01T00:00:00.000Z'),
          new Date('2024-02-01T00:00:00.000Z'),
          10,
          'issue',
        ),
      ]);

      await graphUseCase.createContributionsGraph('test-user');

      expect(mockGitHubClient.getTotalContributions).toHaveBeenCalled();
      const firstCall = mockGitHubClient.getTotalContributions.mock.calls[0];
      expect(firstCall[0]).toBe('test-user');
      expect(firstCall[1]).toBe('2024-01-01T00:00:00.000Z');
    });

    test('should create a graph with specified dates', async () => {
      const { mockGitHubClient, graphUseCase } = setup();

      mockGitHubClient.getTotalContributions.mockResolvedValue([
        new Contribution(
          new Date('2023-01-01T00:00:00.000Z'),
          new Date('2023-02-01T00:00:00.000Z'),
          5,
          'commit',
        ),
        new Contribution(
          new Date('2023-01-01T00:00:00.000Z'),
          new Date('2023-02-01T00:00:00.000Z'),
          10,
          'issue',
        ),
      ]);

      await graphUseCase.createContributionsGraph('test-user', '2023-01-01', '2025-01-01');

      expect(mockGitHubClient.getTotalContributions).toHaveBeenCalled();
      // Should generate monthly ranges between 2023-01-01 and 2025-01-01
      expect(mockGitHubClient.getTotalContributions.mock.calls.length).toBeGreaterThan(0);

      const firstCall = mockGitHubClient.getTotalContributions.mock.calls[0];
      expect(firstCall[0]).toBe('test-user');
      expect(firstCall[1]).toBe('2023-01-01T00:00:00.000Z');
    });
  });
});
