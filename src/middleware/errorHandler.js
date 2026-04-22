import { ZodError } from 'zod';
import { logger } from '../config/logger.js';

export function notFoundHandler(_request, response) {
  response.status(404).json({
    message: 'Recurso no encontrado'
  });
}

export function errorHandler(error, _request, response, _next) {
  if (error instanceof ZodError) {
    return response.status(400).json({
      message: 'Validacion fallida',
      details: error.issues.map((issue) => issue.message)
    });
  }

  logger.error({ err: error }, 'Error no controlado');
  return response.status(500).json({
    message: 'Error interno del servidor'
  });
}
