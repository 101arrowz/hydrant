// TODO: add notify_build.py equivalent here

import { FastifyPluginAsync } from "fastify";
import { reloadCatalog } from "../scrapers/catalog";

const adminPlugin: FastifyPluginAsync = async admin => {
  admin.get('/catalog', async (req, res) => {
    return reloadCatalog();
  });
}

const plugin: FastifyPluginAsync = async api => {
  // TODO: protect/remove these routes
  await api.register(adminPlugin, {
    prefix: '/admin'
  });
}

export default plugin;