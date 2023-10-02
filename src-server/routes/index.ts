import { FastifyPluginAsync } from "fastify";
import auth from "./auth";
import admin from "./admin";
import data from "./data";

const plugin: FastifyPluginAsync = async api => {
  await api.register(auth);
  await api.register(admin);
  await api.register(data);
}

export default plugin;