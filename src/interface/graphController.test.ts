import { Request, Response } from 'express';
import { GraphUseCase } from '../application/graphUseCase';
import { GraphController } from './graphController';

describe('GraphController', () => {
  const setup = () => {
    const mockGraphUseCase: jest.Mocked<GraphUseCase> = {
      createGraph: jest.fn(),
    };
    const graphController = new GraphController(mockGraphUseCase);
    return { mockGraphUseCase, graphController };
  };

  describe('getGraph', () => {
    it('should create a graph and return 200 with image/png content type', async () => {
      const { mockGraphUseCase, graphController } = setup();

      const req = {
        query: {
          user: 'testuser',
          from: '2025-01-01',
          to: '2025-12-31',
          theme: 'default',
          size: 'medium',
        },
      } as unknown as Request;

      const res = {
        setHeader: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      const mockGraphBuffer = Buffer.from('mock graph data');
      mockGraphUseCase.createGraph.mockResolvedValue(mockGraphBuffer);

      await graphController.getGraph(req, res);

      expect(mockGraphUseCase.createGraph).toHaveBeenCalledWith(
        'testuser',
        '2025-01-01',
        '2025-12-31',
        'default',
        'medium',
      );
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/png');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(mockGraphBuffer);
    });
  });
});
