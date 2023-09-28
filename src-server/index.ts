import fastify from 'fastify';
import createAPI from './server';


async function main() {
  const port = +(process.env.PORT || '6873');
  const api = await createAPI(fastify());
  await api.listen({ port });
  console.log(`Backend listening on http://localhost:${port}`);
}

main().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
})