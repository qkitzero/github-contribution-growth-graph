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
    it('should create a graph and return 200', async () => {
      const { mockGraphUseCase, graphController } = setup();

      const req = {} as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      mockGraphUseCase.createGraph.mockResolvedValue();

      await graphController.getGraph(req, res);

      expect(mockGraphUseCase.createGraph).toHaveBeenCalledWith(
        'test-service',
        'INFO',
        'Test message',
        'user-id',
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith();
    });
  });
});
