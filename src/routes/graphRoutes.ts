import { Router } from 'express';
import { GraphUseCaseImpl } from '../application/graphUseCase';
import { ClientImpl as GithubClientImpl } from '../infrastructure/api/github/client';
import { GraphController } from '../interface/graphController';

const router = Router();

const githubClient = new GithubClientImpl(process.env.GITHUB_TOKEN);

const graphUseCase = new GraphUseCaseImpl(githubClient);

const graphController = new GraphController(graphUseCase);

router.get('/contributions', graphController.getContributionsGraph);

export default router;
