import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import session from '@fastify/session';
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { randomUUID } from 'crypto';
import { FastifyInstance } from 'fastify';
import { ZodError } from 'zod';


const addMiddleware = async (api: FastifyInstance) => {
  api.setValidatorCompiler(validatorCompiler);
  api.setSerializerCompiler(serializerCompiler);
  api.setErrorHandler((err, req, res) => {
    if (err instanceof ZodError) {
      res.status(400);
      return {
        error: {
          type: "validation",
          context: err.validationContext ?? null,
          issues: err.issues
        }
      }
    }
    res.status(err.statusCode ?? 500);
    return {
      error: {
        type: "type" in err && typeof err.type === "string"
          ? err.type
          : "unknown",
        message: err.message
      }
    }
  });
  await api.register(cors);
  await api.register(cookie);
  await api.register(session, {
    secret: process.env.COOKIE_SECRET ?? randomUUID()
  });
}

export default addMiddleware;