import { FastifyPluginAsync } from "fastify";
import auth from './auth';

const plugin: FastifyPluginAsync = async api => {
  await api.register(auth);
}

export default plugin;