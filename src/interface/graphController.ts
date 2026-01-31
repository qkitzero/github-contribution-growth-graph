import { Request, Response } from 'express';
import { GraphUseCase } from '../application/graphUseCase';
import { LoggingUseCase } from '../application/loggingUseCase';

export class GraphController {
  constructor(
    private readonly loggingUseCase: LoggingUseCase,
    private readonly graphUseCase: GraphUseCase,
  ) {}

  getContributionsGraph = async (req: Request, res: Response) => {
    const { user, from, to, theme, size, types } = req.query as {
      user: string;
      from?: string;
      to?: string;
      theme?: string;
      size?: string;
      types?: string;
    };

    await this.loggingUseCase.createLog(
      'github-contribution-growth-graph',
      'INFO',
      `User ${user} created contributions graph with from=${from}, to=${to}, theme=${theme}, size=${size}, types=${types}`,
    );

    const image = await this.graphUseCase.createContributionsGraph(
      user,
      from,
      to,
      theme,
      size,
      types,
    );

    res.setHeader('Content-Type', 'image/png');
    res.status(200).send(image);
  };

  getLanguagesGraph = async (req: Request, res: Response) => {
    const { user, from, to, size } = req.query as {
      user: string;
      from?: string;
      to?: string;
      size?: string;
    };

    await this.loggingUseCase.createLog(
      'github-contribution-growth-graph',
      'INFO',
      `User ${user} created languages graph with from=${from}, to=${to}, size=${size}`,
    );

    const image = await this.graphUseCase.createLanguagesGraph(user, from, to, size);

    res.setHeader('Content-Type', 'image/png');
    res.status(200).send(image);
  };
}
