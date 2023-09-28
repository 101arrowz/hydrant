import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";

declare module 'fastify' {
  interface Session {
    loginRedirect?: string;
  }
}

const authPlugin: FastifyPluginAsync = async auth => {
  auth.withTypeProvider<ZodTypeProvider>()
    .get('/login', {
      schema: {
        querystring: z.object({
          redirect: z.custom<string>(data =>
            typeof data === 'string' &&
            new URL(data, process.env.SITE).origin === process.env.SITE
          ).optional()
        })
      }
    }, async (req, res) => {
      req.session.loginRedirect = req.query.redirect ?? '/';
      const target = new URL('/login', process.env.FIREROAD_API_BASE);
      target.searchParams.append('redirect', `${process.env.API_BASE}/auth/loggedin`);
      res.redirect(target.href);
    })
    .get('/loggedin', {
      schema: {
        querystring: z.object({
          code: z.string()
        })
      }
    }, async (req, res) => {
      // TODO: save credentials to session
      const redirectTo = new URL(req.session.loginRedirect ?? '/', process.env.SITE);
      res.redirect(redirectTo.href);
      req.session.loginRedirect = undefined;
    })
}

const plugin: FastifyPluginAsync = async api => {
  api.register(authPlugin, {
    prefix: '/auth'
  });
}

export default plugin;