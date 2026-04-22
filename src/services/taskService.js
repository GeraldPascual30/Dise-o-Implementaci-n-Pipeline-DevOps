import { z } from 'zod';
import { getDatabase, persistDatabase } from '../db/connection.js';

const createTaskSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().max(500).optional().default(''),
  status: z.enum(['todo', 'in_progress', 'done']).optional().default('todo'),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium')
});

const updateTaskSchema = createTaskSchema.partial().refine(
  (payload) => Object.keys(payload).length > 0,
  'Debe enviar al menos un campo para actualizar'
);

function mapRows(result) {
  const columns = result.columns || [];
  const rows = result.values || [];

  return rows.map((row) =>
    columns.reduce((record, column, index) => {
      record[column] = row[index];
      return record;
    }, {})
  );
}

export async function listTasks(dbFile) {
  const db = await getDatabase(dbFile);
  const result = db.exec(`
    SELECT id, title, description, status, priority, createdAt, updatedAt
    FROM tasks
    ORDER BY
      CASE status
        WHEN 'in_progress' THEN 1
        WHEN 'todo' THEN 2
        ELSE 3
      END,
      updatedAt DESC;
  `);

  return result.length === 0 ? [] : mapRows(result[0]);
}

export async function getTaskStats(dbFile) {
  const db = await getDatabase(dbFile);
  const result = db.exec(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'todo' THEN 1 ELSE 0 END) AS todo,
      SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS inProgress,
      SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) AS done
    FROM tasks;
  `);

  if (result.length === 0) {
    return { total: 0, todo: 0, inProgress: 0, done: 0 };
  }

  const [stats] = mapRows(result[0]);
  return {
    total: Number(stats.total || 0),
    todo: Number(stats.todo || 0),
    inProgress: Number(stats.inProgress || 0),
    done: Number(stats.done || 0)
  };
}

export async function createTask(dbFile, payload) {
  const input = createTaskSchema.parse(payload);
  const db = await getDatabase(dbFile);
  const timestamp = new Date().toISOString();

  db.run(
    `
      INSERT INTO tasks (title, description, status, priority, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?);
    `,
    [
      input.title,
      input.description,
      input.status,
      input.priority,
      timestamp,
      timestamp
    ]
  );

  await persistDatabase();

  const result = db.exec(`
    SELECT id, title, description, status, priority, createdAt, updatedAt
    FROM tasks
    ORDER BY id DESC
    LIMIT 1;
  `);

  return mapRows(result[0])[0];
}

export async function updateTask(dbFile, taskId, payload) {
  const input = updateTaskSchema.parse(payload);
  const db = await getDatabase(dbFile);
  const existingTask = db.exec(`
    SELECT id, title, description, status, priority, createdAt, updatedAt
    FROM tasks
    WHERE id = ${Number(taskId)};
  `);

  if (existingTask.length === 0) {
    return null;
  }

  const [current] = mapRows(existingTask[0]);
  const nextTask = {
    ...current,
    ...input,
    updatedAt: new Date().toISOString()
  };

  db.run(
    `
      UPDATE tasks
      SET title = ?, description = ?, status = ?, priority = ?, updatedAt = ?
      WHERE id = ?;
    `,
    [
      nextTask.title,
      nextTask.description,
      nextTask.status,
      nextTask.priority,
      nextTask.updatedAt,
      Number(taskId)
    ]
  );

  await persistDatabase();
  return nextTask;
}

export async function deleteTask(dbFile, taskId) {
  const db = await getDatabase(dbFile);
  const existingTask = db.exec(`
    SELECT id
    FROM tasks
    WHERE id = ${Number(taskId)};
  `);

  if (existingTask.length === 0) {
    return false;
  }

  db.run(`DELETE FROM tasks WHERE id = ?;`, [Number(taskId)]);
  await persistDatabase();
  return true;
}
