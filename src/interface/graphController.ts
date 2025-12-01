import { Request, Response } from 'express';
import { GraphUseCase } from '../application/graphUseCase';

export class GraphController {
  constructor(private readonly graphUseCase: GraphUseCase) {}

  getGraph = async (req: Request, res: Response) => {
    const { user } = req.query as { user: string };

    const image = await this.graphUseCase.createGraph(user);

    res.setHeader('Content-Type', 'image/png');
    res.status(200).send(image);
  };
}
