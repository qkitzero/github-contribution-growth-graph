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
        { date: new Date('2025-01-01'), count: 5 },
        { date: new Date('2025-01-02'), count: 10 },
      ];
      mockGitHubClient.getContributions.mockResolvedValue(contributions);

      const user = 'user';
      await graphUseCase.createGraph(user);

      expect(mockGitHubClient.getContributions).toHaveBeenCalledWith(
        user,
        '2024-01-01T00:00:00.000Z',
        '2025-01-01T00:00:00.000Z',
      );
    });
  });
});
