import fs from 'node:fs/promises';
import path from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { initializeSchema } from '../../src/db/schema.js';
import { resetDatabase } from '../../src/db/connection.js';
import {
  createTask,
  deleteTask,
  getTaskStats,
  listTasks,
  updateTask
} from '../../src/services/taskService.js';

const dbFile = path.resolve('tests/fixtures/unit.sqlite');

describe('taskService', () => {
  beforeEach(async () => {
    await fs.rm(dbFile, { force: true });
    await resetDatabase();
    await initializeSchema(dbFile);
  });

  it('crea y lista tareas', async () => {
    const task = await createTask(dbFile, {
      title: 'Preparar pipeline CI',
      description: 'Configurar workflow de GitHub Actions',
      status: 'todo',
      priority: 'high'
    });

    const tasks = await listTasks(dbFile);

    expect(task.id).toBeTypeOf('number');
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('Preparar pipeline CI');
  });

  it('actualiza el estado y calcula estadisticas', async () => {
    const task = await createTask(dbFile, {
      title: 'Instrumentar metricas',
      priority: 'medium'
    });

    const updatedTask = await updateTask(dbFile, task.id, {
      status: 'done'
    });
    const stats = await getTaskStats(dbFile);

    expect(updatedTask.status).toBe('done');
    expect(stats).toEqual({
      total: 1,
      todo: 0,
      inProgress: 0,
      done: 1
    });
  });

  it('elimina una tarea existente', async () => {
    const task = await createTask(dbFile, {
      title: 'Eliminar deuda tecnica'
    });

    const deleted = await deleteTask(dbFile, task.id);
    const tasks = await listTasks(dbFile);

    expect(deleted).toBe(true);
    expect(tasks).toHaveLength(0);
  });
});
