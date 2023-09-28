import { FastifyInstance } from 'fastify';
import addMiddleware from './middleware';
import routes from './routes';

async function createAPI(api: FastifyInstance) {
  await addMiddleware(api);
  await api.register(routes);
  return api;
}


export default createAPI;