import dotenv from 'dotenv-flow';
dotenv.config()

import api from './server';

const port = +(process.env.API_PORT || '6873')

api.then(api => api.listen({ port })).then(address => {
  console.log(`Backend listening on http://0.0.0.0:${port}`);
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
})