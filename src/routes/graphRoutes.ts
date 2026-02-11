import { Router } from 'express';
import createClient from 'openapi-fetch';
import { GraphUseCaseImpl } from '../application/graphUseCase';
import { AuthServiceImpl } from '../infrastructure/api/auth/authService';
import { paths as authPaths } from '../infrastructure/api/auth/schema';
import { GitHubClientImpl } from '../infrastructure/api/github/client';
import { LoggingServiceImpl } from '../infrastructure/api/logging/loggingService';
import { paths as loggingPaths } from '../infrastructure/api/logging/schema';
import { GraphController } from '../interface/graphController';

const router = Router();

const authClientProtocol = process.env.ENV === 'production' ? 'https' : 'http';
const authClientHost = process.env.AUTH_SERVICE_HOST;
const authClientPort = process.env.AUTH_SERVICE_PORT;
const authClientBaseUrl = `${authClientProtocol}://${authClientHost}:${authClientPort}`;
const authClient = createClient<authPaths>({ baseUrl: authClientBaseUrl });
const authM2MClientId = process.env.AUTH_M2M_CLIENT_ID!;
const authM2MClientSecret = process.env.AUTH_M2M_CLIENT_SECRET!;

const loggingClientProtocol = process.env.ENV === 'production' ? 'https' : 'http';
const loggingClientHost = process.env.LOGGING_SERVICE_HOST;
const loggingClientPort = process.env.LOGGING_SERVICE_PORT;
const loggingClientBaseUrl = `${loggingClientProtocol}://${loggingClientHost}:${loggingClientPort}`;
const loggingClient = createClient<loggingPaths>({ baseUrl: loggingClientBaseUrl });

const authService = new AuthServiceImpl(authClient, authM2MClientId, authM2MClientSecret);
const loggingService = new LoggingServiceImpl(loggingClient);
const githubClient = new GitHubClientImpl(process.env.GITHUB_TOKEN);

const graphUseCase = new GraphUseCaseImpl(authService, loggingService, githubClient);

const graphController = new GraphController(graphUseCase);

router.get('/contributions', graphController.getContributionsGraph);
router.get('/languages', graphController.getLanguagesGraph);

export default router;
