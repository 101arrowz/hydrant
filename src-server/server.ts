import fastify from 'fastify';
import addMiddleware from './middleware';
import routes from './routes';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';

async function createAPI() {
  const api = fastify();
  await addMiddleware(api);
  await api.register(routes);
  return api;
}


export default createAPI();