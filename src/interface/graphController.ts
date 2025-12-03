import { Request, Response } from 'express';
import { GraphUseCase } from '../application/graphUseCase';

export class GraphController {
  constructor(private readonly graphUseCase: GraphUseCase) {}

  getGraph = async (req: Request, res: Response) => {
    const { user, from, to, bg, color, width, height } = req.query as {
      user: string;
      from?: string;
      to?: string;
      width?: string;
      height?: string;
      bg?: string;
      color?: string;
    };

    const image = await this.graphUseCase.createGraph(
      user,
      from,
      to,
      width ? Number(width) : undefined,
      height ? Number(height) : undefined,
      bg,
      color,
    );

    res.setHeader('Content-Type', 'image/png');
    res.status(200).send(image);
  };
}
