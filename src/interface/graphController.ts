import { Request, Response } from 'express';
import { ValidationError } from '../application/errors';
import { GraphUseCase } from '../application/graphUseCase';

export class GraphController {
  private static readonly CACHE_CONTROL_HEADER = 'public, max-age=1800, s-maxage=1800';

  constructor(private readonly graphUseCase: GraphUseCase) {}

  getContributionsGraph = async (req: Request, res: Response) => {
    const { user, from, to, theme, size, types } = req.query as {
      user: string;
      from?: string;
      to?: string;
      theme?: string;
      size?: string;
      types?: string;
    };

    if (!user) throw new ValidationError('Missing required query parameter: user');

    const image = await this.graphUseCase.createContributionsGraph(
      user,
      from,
      to,
      theme,
      size,
      types,
    );

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', GraphController.CACHE_CONTROL_HEADER);
    res.status(200).send(image);
  };

  getLanguagesGraph = async (req: Request, res: Response) => {
    const { user, from, to, size } = req.query as {
      user: string;
      from?: string;
      to?: string;
      size?: string;
    };

    if (!user) throw new ValidationError('Missing required query parameter: user');

    const image = await this.graphUseCase.createLanguagesGraph(user, from, to, size);

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', GraphController.CACHE_CONTROL_HEADER);
    res.status(200).send(image);
  };
}
