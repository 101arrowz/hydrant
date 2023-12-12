import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { ZodError } from 'zod';
import makePlugin from 'fastify-plugin';

export default makePlugin(async api => {
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
});