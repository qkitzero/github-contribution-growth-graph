import { Router } from 'express';
import { GraphUseCaseImpl } from '../application/graphUseCase';
import { Client as GithubClient } from '../infrastructure/api/github/client';
import { GraphController } from '../interface/graphController';

const router = Router();

const githubClient = new GithubClient();

const graphUseCase = new GraphUseCaseImpl(githubClient);

const graphController = new GraphController(graphUseCase);

router.get('/', graphController.getGraph);

export default router;
