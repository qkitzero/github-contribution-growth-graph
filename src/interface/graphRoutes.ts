import { Router } from 'express';
import { GraphController } from './graphController';

export const createGraphRoutes = (graphController: GraphController): Router => {
  const router = Router();
  router.get('/contributions', graphController.getContributionsGraph);
  router.get('/languages', graphController.getLanguagesGraph);
  return router;
};
