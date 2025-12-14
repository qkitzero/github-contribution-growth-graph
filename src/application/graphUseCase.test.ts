import { Contribution } from '../domain/contribution/contribution';
import { Client as GitHubClient } from '../infrastructure/api/github/client';
import { GraphUseCaseImpl } from './graphUseCase';

describe('GraphUseCase', () => {
  const setup = () => {
    const mockGitHubClient: jest.Mocked<GitHubClient> = {
      getContributions: jest.fn(),
    };
    const graphUseCase = new GraphUseCaseImpl(mockGitHubClient);
    return { mockGitHubClient, graphUseCase };
  };

  describe('createGraph', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should create a graph with default dates', async () => {
      const { mockGitHubClient, graphUseCase } = setup();

      const contributions: Contribution[] = [
        { date: new Date('2024-01-01'), count: 5 },
        { date: new Date('2024-01-02'), count: 10 },
      ];
      mockGitHubClient.getContributions.mockResolvedValue(contributions);

      await graphUseCase.createGraph('test-user');

      expect(mockGitHubClient.getContributions).toHaveBeenCalledTimes(1);
      expect(mockGitHubClient.getContributions).toHaveBeenNthCalledWith(
        1,
        'test-user',
        '2024-01-01T00:00:00.000Z',
        '2025-01-01T00:00:00.000Z',
      );
    });

    test('should create a graph with specified dates', async () => {
      const { mockGitHubClient, graphUseCase } = setup();

      const contributions: Contribution[] = [
        { date: new Date('2024-01-01'), count: 5 },
        { date: new Date('2024-01-02'), count: 10 },
      ];
      mockGitHubClient.getContributions.mockResolvedValue(contributions);

      await graphUseCase.createGraph('test-user', '2023-01-01', '2025-01-01');

      expect(mockGitHubClient.getContributions).toHaveBeenCalledTimes(2);
      expect(mockGitHubClient.getContributions).toHaveBeenNthCalledWith(
        1,
        'test-user',
        '2023-01-01T00:00:00.000Z',
        '2024-01-01T00:00:00.000Z',
      );
      expect(mockGitHubClient.getContributions).toHaveBeenNthCalledWith(
        2,
        'test-user',
        '2024-01-01T00:00:00.000Z',
        '2025-01-01T00:00:00.000Z',
      );
    });
  });
});
