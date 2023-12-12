import { FastifyInstance } from 'fastify';
import routes from './routes';
import middleware from './middleware';

async function createAPI(api: FastifyInstance) {
  await api.register(middleware)
  await api.register(routes);
  return api;
}


export default createAPI;