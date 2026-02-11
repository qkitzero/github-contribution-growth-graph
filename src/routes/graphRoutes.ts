import { Router } from 'express';
import createClient from 'openapi-fetch';
import { GraphUseCaseImpl } from '../application/graphUseCase';
import { GitHubClientImpl } from '../infrastructure/api/github/client';
import { LoggingServiceImpl } from '../infrastructure/api/logging/loggingService';
import { paths } from '../infrastructure/api/logging/schema';
import { GraphController } from '../interface/graphController';

const router = Router();

const loggingClientProtocol = process.env.ENV === 'production' ? 'https' : 'http';
const loggingClientHost = process.env.LOGGING_SERVICE_HOST;
const loggingClientPort = process.env.LOGGING_SERVICE_PORT;
const loggingClientBaseUrl = `${loggingClientProtocol}://${loggingClientHost}:${loggingClientPort}`;
const loggingClient = createClient<paths>({ baseUrl: loggingClientBaseUrl });

const loggingService = new LoggingServiceImpl(loggingClient);
const githubClient = new GitHubClientImpl(process.env.GITHUB_TOKEN);

const graphUseCase = new GraphUseCaseImpl(loggingService, githubClient);

const graphController = new GraphController(graphUseCase);

router.get('/contributions', graphController.getContributionsGraph);
router.get('/languages', graphController.getLanguagesGraph);

export default router;
