import { Request, Response } from 'express';
import { GraphUseCase } from '../application/graphUseCase';

export class GraphController {
  constructor(private readonly graphUseCase: GraphUseCase) {}

  getGraph = async (req: Request, res: Response) => {
    const { user } = req.query as { user: string };

    this.graphUseCase.createGraph(user);

    res.status(200).json();
  };
}
