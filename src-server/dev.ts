import dotenv from "dotenv-flow";
dotenv.config();

import fastify from "fastify";
import staticFiles from "@fastify/static";
import createAPI from "./server";
import { join } from "path";

async function main() {
  const app = fastify();
  const port = +(process.env.PORT || '3428');

  app.register(staticFiles, {
    root: join(__dirname, '..', 'build')
  });

  // TEMPORARY: will be replaced by proper handling soon
  app.register(staticFiles, {
    root: join(__dirname, 'data'),
    prefix: '/api/data',
    decorateReply: false
  });

  await app.register(createAPI, {
    prefix: '/api'
  });
  await app.listen({ port });
  console.log(`App listening on http://localhost:${port}\n`);
}

main().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});