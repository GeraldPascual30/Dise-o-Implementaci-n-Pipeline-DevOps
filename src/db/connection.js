import fs from 'node:fs/promises';
import path from 'node:path';
import initSqlJs from 'sql.js';
import { logger } from '../config/logger.js';

let dbInstance;
let SQL;
let databaseFilePath;

async function ensureDirectoryExists(filePath) {
  const directory = path.dirname(filePath);
  await fs.mkdir(directory, { recursive: true });
}

async function loadDatabase(filePath) {
  await ensureDirectoryExists(filePath);
  databaseFilePath = filePath;
  SQL = await initSqlJs({});

  try {
    const fileBuffer = await fs.readFile(filePath);
    dbInstance = new SQL.Database(fileBuffer);
    logger.info({ filePath }, 'Base de datos SQLite cargada');
  } catch (error) {
    if (error.code === 'ENOENT') {
      dbInstance = new SQL.Database();
      logger.info({ filePath }, 'Base de datos SQLite creada');
      await persistDatabase();
      return dbInstance;
    }

    throw error;
  }

  return dbInstance;
}

export async function getDatabase(filePath) {
  if (!dbInstance) {
    await loadDatabase(filePath);
  }

  return dbInstance;
}

export async function persistDatabase() {
  if (!dbInstance || !databaseFilePath) {
    return;
  }

  const data = Buffer.from(dbInstance.export());
  await fs.writeFile(databaseFilePath, data);
}

export async function resetDatabase() {
  dbInstance = undefined;
  SQL = undefined;
  databaseFilePath = undefined;
}
