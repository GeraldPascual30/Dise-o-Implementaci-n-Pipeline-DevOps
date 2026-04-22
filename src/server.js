import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';

const app = await createApp(env);

app.listen(env.port, env.host, () => {
  logger.info(
    {
      host: env.host,
      port: env.port
    },
    'Servidor iniciado'
  );
});
