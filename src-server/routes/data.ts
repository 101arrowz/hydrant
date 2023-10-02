import { FastifyPluginAsync } from "fastify";

const dataPlugin: FastifyPluginAsync = async data => {
  
}

const plugin: FastifyPluginAsync = async api => {
  await api.register(dataPlugin, {
    prefix: '/auth'
  });
}

export default plugin;