import { Request, Response } from 'express';
import { ValidationError } from '../application/errors';
import { GraphUseCase } from '../application/graphUseCase';
import { GraphController } from './graphController';

describe('GraphController', () => {
  const CACHE_CONTROL_HEADER_VALUE = 'public, max-age=1800, s-maxage=1800';

  const setup = () => {
    const mockGraphUseCase: jest.Mocked<GraphUseCase> = {
      createContributionsGraph: jest.fn(),
      createLanguagesGraph: jest.fn(),
    };
    const graphController = new GraphController(mockGraphUseCase);
    return { mockGraphUseCase, graphController };
  };

  describe('getContributionsGraph', () => {
    it('should create a graph and return 200 with image/png content type', async () => {
      const { mockGraphUseCase, graphController } = setup();

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

      expect(mockGraphUseCase.createContributionsGraph).toHaveBeenCalledWith(
        'testuser',
        '2025-01-01',
        '2025-12-31',
        'default',
        'medium',
        'commit,issue,pr,review',
      );
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/png');
      expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', CACHE_CONTROL_HEADER_VALUE);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(mockGraphBuffer);
    });

    it('should throw ValidationError when user is not provided', async () => {
      const { graphController } = setup();

      const req = {
        query: {},
      } as unknown as Request;

      const res = {
        setHeader: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      await expect(graphController.getContributionsGraph(req, res)).rejects.toThrow(
        ValidationError,
      );
      await expect(graphController.getContributionsGraph(req, res)).rejects.toThrow(
        'Missing required query parameter: user',
      );
    });
  });

  describe('getLanguagesGraph', () => {
    it('should create a graph and return 200 with image/png content type', async () => {
      const { mockGraphUseCase, graphController } = setup();

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

      expect(mockGraphUseCase.createLanguagesGraph).toHaveBeenCalledWith(
        'testuser',
        '2025-01-01',
        '2025-12-31',
        'medium',
      );
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/png');
      expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', CACHE_CONTROL_HEADER_VALUE);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(mockGraphBuffer);
    });

    it('should throw ValidationError when user is not provided', async () => {
      const { graphController } = setup();

      const req = {
        query: {},
      } as unknown as Request;

      const res = {
        setHeader: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      await expect(graphController.getLanguagesGraph(req, res)).rejects.toThrow(ValidationError);
      await expect(graphController.getLanguagesGraph(req, res)).rejects.toThrow(
        'Missing required query parameter: user',
      );
    });
  });
});
