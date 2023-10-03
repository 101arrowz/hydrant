import fastifyStatic from "@fastify/static";
import { FastifyPluginAsync } from "fastify";
import { dataDir } from "../util/fs";

const dataPlugin: FastifyPluginAsync = async data => {
  await data.register(fastifyStatic, {
    root: dataDir,
    decorateReply: false
  });
}

const plugin: FastifyPluginAsync = async api => {
  await api.register(dataPlugin, {
    prefix: '/data'
  });
}

export default plugin;