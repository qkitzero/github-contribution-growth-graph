import { Router } from 'express';
import createClient from 'openapi-fetch';
import { GraphUseCaseImpl } from '../application/graphUseCase';
import { ClientImpl as GithubClientImpl } from '../infrastructure/api/github/client';
import { LoggingUseCaseImpl } from '../infrastructure/api/logging/loggingUseCase';
import { paths } from '../infrastructure/api/logging/schema';
import { GraphController } from '../interface/graphController';

const router = Router();

const loggingClientProtocol = process.env.ENV === 'production' ? 'https' : 'http';
const loggingClientHost = process.env.LOGGING_SERVICE_HOST;
const loggingClientPort = process.env.LOGGING_SERVICE_PORT;
const loggingClientBaseUrl = `${loggingClientProtocol}://${loggingClientHost}:${loggingClientPort}`;
const loggingClient = createClient<paths>({ baseUrl: loggingClientBaseUrl });

const githubClient = new GithubClientImpl(process.env.GITHUB_TOKEN);

const loggingUseCase = new LoggingUseCaseImpl(loggingClient);
const graphUseCase = new GraphUseCaseImpl(githubClient);

const graphController = new GraphController(loggingUseCase, graphUseCase);

router.get('/contributions', graphController.getContributionsGraph);
router.get('/languages', graphController.getLanguagesGraph);

export default router;
