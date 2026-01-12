import { Contribution, CONTRIBUTION_TYPES } from '../domain/contribution/contribution';
import { Language } from '../domain/language/language';
import { Client as GitHubClient } from '../infrastructure/api/github/client';
import { GraphUseCaseImpl } from './graphUseCase';

describe('GraphUseCase', () => {
  const setup = () => {
    const mockGitHubClient: jest.Mocked<GitHubClient> = {
      getTotalContributions: jest.fn(),
      getLanguageContributions: jest.fn(),
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
          10,
          CONTRIBUTION_TYPES.COMMIT,
        ),
        new Contribution(
          new Date('2024-01-01T00:00:00.000Z'),
          new Date('2024-02-01T00:00:00.000Z'),
          10,
          CONTRIBUTION_TYPES.ISSUE,
        ),
      ]);

      await graphUseCase.createContributionsGraph('test-user');

      expect(mockGitHubClient.getTotalContributions).toHaveBeenCalled();
      const firstCall = mockGitHubClient.getTotalContributions.mock.calls[0];
      expect(firstCall[0]).toBe('test-user');
      expect(firstCall[1]).toBe('2024-01-01T00:00:00.000Z');
      expect(firstCall[2]).toBe('2024-02-01T00:00:00.000Z');
    });

    test('should create a graph with specified dates', async () => {
      const { mockGitHubClient, graphUseCase } = setup();

      mockGitHubClient.getTotalContributions.mockResolvedValue([
        new Contribution(
          new Date('2023-01-01T00:00:00.000Z'),
          new Date('2023-02-01T00:00:00.000Z'),
          10,
          CONTRIBUTION_TYPES.COMMIT,
        ),
        new Contribution(
          new Date('2023-01-01T00:00:00.000Z'),
          new Date('2023-02-01T00:00:00.000Z'),
          10,
          CONTRIBUTION_TYPES.ISSUE,
        ),
      ]);

      await graphUseCase.createContributionsGraph('test-user', '2023-01-01', '2025-01-01');

      expect(mockGitHubClient.getTotalContributions).toHaveBeenCalled();
      const firstCall = mockGitHubClient.getTotalContributions.mock.calls[0];
      expect(firstCall[0]).toBe('test-user');
      expect(firstCall[1]).toBe('2023-01-01T00:00:00.000Z');
      expect(firstCall[2]).toBe('2023-02-01T00:00:00.000Z');
    });

    test('should create a graph with specified types', async () => {
      const { mockGitHubClient, graphUseCase } = setup();

      mockGitHubClient.getTotalContributions.mockResolvedValue([
        new Contribution(
          new Date('2024-01-01T00:00:00.000Z'),
          new Date('2024-02-01T00:00:00.000Z'),
          10,
          CONTRIBUTION_TYPES.COMMIT,
        ),
        new Contribution(
          new Date('2024-01-01T00:00:00.000Z'),
          new Date('2024-02-01T00:00:00.000Z'),
          10,
          CONTRIBUTION_TYPES.ISSUE,
        ),
        new Contribution(
          new Date('2024-01-01T00:00:00.000Z'),
          new Date('2024-02-01T00:00:00.000Z'),
          10,
          CONTRIBUTION_TYPES.PR,
        ),
        new Contribution(
          new Date('2024-01-01T00:00:00.000Z'),
          new Date('2024-02-01T00:00:00.000Z'),
          10,
          CONTRIBUTION_TYPES.REVIEW,
        ),
      ]);

      await graphUseCase.createContributionsGraph(
        'test-user',
        undefined,
        undefined,
        undefined,
        undefined,
        'commit,issue',
      );

      expect(mockGitHubClient.getTotalContributions).toHaveBeenCalled();
      const firstCall = mockGitHubClient.getTotalContributions.mock.calls[0];
      expect(firstCall[0]).toBe('test-user');
      expect(firstCall[1]).toBe('2024-01-01T00:00:00.000Z');
      expect(firstCall[2]).toBe('2024-02-01T00:00:00.000Z');
    });
  });

  describe('createLanguagesGraph', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should create a language graph with default dates', async () => {
      const { mockGitHubClient, graphUseCase } = setup();

      mockGitHubClient.getLanguageContributions.mockResolvedValue([
        new Language(
          new Date('2024-01-01T00:00:00.000Z'),
          new Date('2024-02-01T00:00:00.000Z'),
          'TypeScript',
          '#3178c6',
          100,
        ),
        new Language(
          new Date('2024-01-01T00:00:00.000Z'),
          new Date('2024-02-01T00:00:00.000Z'),
          'Go',
          '#00ADD8',
          100,
        ),
      ]);

      await graphUseCase.createLanguagesGraph('test-user');

      expect(mockGitHubClient.getLanguageContributions).toHaveBeenCalled();
      const firstCall = mockGitHubClient.getLanguageContributions.mock.calls[0];
      expect(firstCall[0]).toBe('test-user');
      expect(firstCall[1]).toBe('2024-01-01T00:00:00.000Z');
      expect(firstCall[2]).toBe('2024-02-01T00:00:00.000Z');
    });

    test('should create a language graph with specified dates', async () => {
      const { mockGitHubClient, graphUseCase } = setup();

      mockGitHubClient.getLanguageContributions.mockResolvedValue([
        new Language(
          new Date('2023-01-01T00:00:00.000Z'),
          new Date('2023-02-01T00:00:00.000Z'),
          'TypeScript',
          '#3178c6',
          100,
        ),
        new Language(
          new Date('2023-01-01T00:00:00.000Z'),
          new Date('2023-02-01T00:00:00.000Z'),
          'Go',
          '#00ADD8',
          100,
        ),
      ]);

      await graphUseCase.createLanguagesGraph('test-user', '2023-01-01', '2025-01-01');

      expect(mockGitHubClient.getLanguageContributions).toHaveBeenCalled();
      const firstCall = mockGitHubClient.getLanguageContributions.mock.calls[0];
      expect(firstCall[0]).toBe('test-user');
      expect(firstCall[1]).toBe('2023-01-01T00:00:00.000Z');
      expect(firstCall[2]).toBe('2023-02-01T00:00:00.000Z');
    });
  });
});
