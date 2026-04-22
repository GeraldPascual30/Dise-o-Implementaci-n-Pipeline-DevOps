import fs from 'node:fs/promises';
import path from 'node:path';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../src/app.js';
import { resetDatabase } from '../../src/db/connection.js';

const dbFile = path.resolve('tests/fixtures/integration.sqlite');

describe('API', () => {
  beforeEach(async () => {
    await fs.rm(dbFile, { force: true });
    await resetDatabase();
  });

  it('expone salud, crea tareas y lista resultados', async () => {
    const app = await createApp({
      dbFile,
      nodeEnv: 'test',
      serviceName: 'devops-task-board-test',
      host: '127.0.0.1',
      port: 0,
      logLevel: 'silent'
    });

    const healthResponse = await request(app).get('/api/health');
    expect(healthResponse.status).toBe(200);
    expect(healthResponse.body.status).toBe('ok');

    const createResponse = await request(app).post('/api/tasks').send({
      title: 'Ejecutar pruebas de integracion',
      description: 'Validar endpoints principales',
      priority: 'high'
    });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.title).toBe('Ejecutar pruebas de integracion');

    const listResponse = await request(app).get('/api/tasks');
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.items).toHaveLength(1);
  });

  it('valida payloads incorrectos', async () => {
    const app = await createApp({
      dbFile,
      nodeEnv: 'test',
      serviceName: 'devops-task-board-test',
      host: '127.0.0.1',
      port: 0,
      logLevel: 'silent'
    });

    const response = await request(app).post('/api/tasks').send({
      title: 'no'
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validacion fallida');
  });
});
