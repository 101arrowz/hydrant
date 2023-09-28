import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import session from '@fastify/session';
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { randomUUID } from 'crypto';
import { FastifyInstance } from 'fastify';


const addMiddleware = async (api: FastifyInstance) => {
  api.setValidatorCompiler(validatorCompiler);
  api.setSerializerCompiler(serializerCompiler);
  await api.register(cors);
  await api.register(cookie);
  await api.register(session, {
    secret: process.env.COOKIE_SECRET ?? randomUUID()
  });
}

export default addMiddleware;