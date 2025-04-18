import { init } from './app';
import { logger } from './utils/logger';

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled rejection:', err);
  process.exit(1);
});

const start = async () => {
  const server = await init();
  await server.start();
  logger.info(`Server running on ${server.info.uri}`);
};

start();