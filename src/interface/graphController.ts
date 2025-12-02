import { Request, Response } from 'express';
import { GraphUseCase } from '../application/graphUseCase';

export class GraphController {
  constructor(private readonly graphUseCase: GraphUseCase) {}

  getGraph = async (req: Request, res: Response) => {
    const { user, from, to } = req.query as {
      user: string;
      from?: string;
      to?: string;
    };

    const image = await this.graphUseCase.createGraph(user, from, to);

    res.setHeader('Content-Type', 'image/png');
    res.status(200).send(image);
  };
}
