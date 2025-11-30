import { Router } from 'express';
import { GraphUseCaseImpl } from '../application/graphUseCase';
import { GraphController } from '../interface/graphController';

const router = Router();

const graphUseCase = new GraphUseCaseImpl();

const graphController = new GraphController(graphUseCase);

router.get('/', graphController.getGraph);

export default router;
