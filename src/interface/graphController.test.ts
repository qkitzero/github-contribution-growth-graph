import { Request, Response } from 'express';
import { GraphUseCase } from '../application/graphUseCase';
import { LoggingUseCase } from '../application/loggingUseCase';
import { GraphController } from './graphController';

describe('GraphController', () => {
  const setup = () => {
    const mockLoggingUseCase: jest.Mocked<LoggingUseCase> = {
      createLog: jest.fn(),
    };
    const mockGraphUseCase: jest.Mocked<GraphUseCase> = {
      createContributionsGraph: jest.fn(),
      createLanguagesGraph: jest.fn(),
    };
    const graphController = new GraphController(mockLoggingUseCase, mockGraphUseCase);
    return { mockLoggingUseCase, mockGraphUseCase, graphController };
  };

  describe('getContributionsGraph', () => {
    it('should create a graph and return 200 with image/png content type', async () => {
      const { mockLoggingUseCase, mockGraphUseCase, graphController } = setup();

      const req = {
        query: {
          user: 'testuser',
          from: '2025-01-01',
          to: '2025-12-31',
          theme: 'default',
          size: 'medium',
          types: 'commit,issue,pr,review',
        },
      } as unknown as Request;

      const res = {
        setHeader: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      const mockGraphBuffer = Buffer.from('mock graph data');
      mockGraphUseCase.createContributionsGraph.mockResolvedValue(mockGraphBuffer);

      await graphController.getContributionsGraph(req, res);

      expect(mockLoggingUseCase.createLog).toHaveBeenCalledWith(
        'github-contribution-growth-graph',
        'INFO',
        `User testuser created contributions graph with from=2025-01-01, to=2025-12-31, theme=default, size=medium, types=commit,issue,pr,review`,
      );
      expect(mockGraphUseCase.createContributionsGraph).toHaveBeenCalledWith(
        'testuser',
        '2025-01-01',
        '2025-12-31',
        'default',
        'medium',
        'commit,issue,pr,review',
      );
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/png');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(mockGraphBuffer);
    });
  });

  describe('getLanguagesGraph', () => {
    it('should create a graph and return 200 with image/png content type', async () => {
      const { mockLoggingUseCase, mockGraphUseCase, graphController } = setup();

      const req = {
        query: {
          user: 'testuser',
          from: '2025-01-01',
          to: '2025-12-31',
          size: 'medium',
        },
      } as unknown as Request;

      const res = {
        setHeader: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      const mockGraphBuffer = Buffer.from('mock graph data');
      mockGraphUseCase.createLanguagesGraph.mockResolvedValue(mockGraphBuffer);

      await graphController.getLanguagesGraph(req, res);

      expect(mockLoggingUseCase.createLog).toHaveBeenCalledWith(
        'github-contribution-growth-graph',
        'INFO',
        `User testuser created languages graph with from=2025-01-01, to=2025-12-31, size=medium`,
      );
      expect(mockGraphUseCase.createLanguagesGraph).toHaveBeenCalledWith(
        'testuser',
        '2025-01-01',
        '2025-12-31',
        'medium',
      );
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/png');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(mockGraphBuffer);
    });
  });
});
