import path from 'node:path';
import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import client from 'prom-client';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { initializeSchema } from './db/schema.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { createApiRouter } from './routes/api.js';

let metricsConfigured = false;
let httpRequestDuration;

function configureMetrics(dbFile) {
  if (metricsConfigured) {
    return;
  }

  client.collectDefaultMetrics();
  httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duracion de las peticiones HTTP en segundos',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.05, 0.1, 0.2, 0.5, 1, 2, 5]
  });
  new client.Gauge({
    name: 'task_board_total_tasks',
    help: 'Numero total de tareas registradas',
    async collect() {
      const { getTaskStats } = await import('./services/taskService.js');
      const stats = await getTaskStats(dbFile);
      this.set(stats.total);
    }
  });

  metricsConfigured = true;
}

export async function createApp(customEnv = env) {
  await initializeSchema(customEnv.dbFile);
  if (customEnv.nodeEnv !== 'test') {
    configureMetrics(customEnv.dbFile);
  }

  const app = express();
  const publicDirectory = path.resolve('src/public');

  app.use(helmet({
    contentSecurityPolicy: false
  }));
  app.use(express.json());
  app.use(
    pinoHttp({
      logger
    })
  );
  app.use((request, response, next) => {
    if (!httpRequestDuration) {
      next();
      return;
    }

    const end = httpRequestDuration.startTimer();
    response.on('finish', () => {
      end({
        method: request.method,
        route: request.route?.path || request.path,
        status_code: response.statusCode
      });
    });
    next();
  });
  app.use(express.static(publicDirectory));
  app.use('/api', createApiRouter({ dbFile: customEnv.dbFile }));

  app.get('/', (_request, response) => {
    response.sendFile(path.join(publicDirectory, 'index.html'));
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
