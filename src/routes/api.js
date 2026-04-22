import { Router } from 'express';
import client from 'prom-client';
import { logger } from '../config/logger.js';
import {
  createTask,
  deleteTask,
  getTaskStats,
  listTasks,
  updateTask
} from '../services/taskService.js';

export function createApiRouter({ dbFile }) {
  const router = Router();
  const asyncHandler = (handler) => (request, response, next) =>
    Promise.resolve(handler(request, response, next)).catch(next);

  router.get('/health', asyncHandler(async (_request, response) => {
    const stats = await getTaskStats(dbFile);
    response.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      stats
    });
  }));

  router.get('/metrics', asyncHandler(async (_request, response) => {
    response.set('Content-Type', client.register.contentType);
    response.end(await client.register.metrics());
  }));

  router.get('/tasks', asyncHandler(async (_request, response) => {
    const tasks = await listTasks(dbFile);
    response.json({ items: tasks });
  }));

  router.get('/stats', asyncHandler(async (_request, response) => {
    const stats = await getTaskStats(dbFile);
    response.json(stats);
  }));

  router.post('/alerts', asyncHandler(async (request, response) => {
    logger.warn({ alerts: request.body?.alerts || [] }, 'Alerta recibida desde Alertmanager');
    response.status(202).json({ received: true });
  }));

  router.post('/tasks', asyncHandler(async (request, response) => {
    const task = await createTask(dbFile, request.body);
    response.status(201).json(task);
  }));

  router.put('/tasks/:id', asyncHandler(async (request, response) => {
    const task = await updateTask(dbFile, request.params.id, request.body);

    if (!task) {
      return response.status(404).json({
        message: 'Tarea no encontrada'
      });
    }

    return response.json(task);
  }));

  router.delete('/tasks/:id', asyncHandler(async (request, response) => {
    const deleted = await deleteTask(dbFile, request.params.id);

    if (!deleted) {
      return response.status(404).json({
        message: 'Tarea no encontrada'
      });
    }

    return response.status(204).send();
  }));

  return router;
}
