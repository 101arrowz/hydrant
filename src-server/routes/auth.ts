import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";

declare module 'fastify' {
  interface Session {
    loginRedirect?: string;
    fireroadToken?: string;
  }
}

class AuthError extends Error {
  readonly statusCode = 401;
  readonly type = 'auth';
  constructor (message: string) {
    super(message);
  }
}

const fetchTokenResponse = z.object({
  success: z.literal(true),
  access_info: z.object({
    access_token: z.string()
  })
});

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
      target.searchParams.append('redirect', `${process.env.SITE}/api/auth/loggedin`);
      res.redirect(target.href);
    })
    .get('/loggedin', {
      schema: {
        querystring: z.object({
          code: z.string()
        })
      }
    }, async (req, res) => {
      const redirectTo = new URL(req.session.loginRedirect ?? '/', process.env.SITE);
      req.session.loginRedirect = undefined;

      const target = new URL('/fetch_token', process.env.FIREROAD_API_BASE);
      target.searchParams.append('code', req.query.code);
      const tokenRes = await fetch(target);
  
      if (!tokenRes.ok) {
        throw new AuthError('failed to get fireroad token');
      }
      const authResult = fetchTokenResponse.parse(await tokenRes.json());
      req.session.fireroadToken = authResult.access_info.access_token;

      res.redirect(redirectTo.href);
    })
    .get('/status', {
      schema: {
        headers: z.object({
          // 3rd party API access through FireRoad JWT in bearer
          Authorization: z.string().startsWith('Bearer ').optional()
        })
      }
    }, async (req, res) => {
      
    });
}

const plugin: FastifyPluginAsync = async api => {
  await api.register(authPlugin, {
    prefix: '/auth'
  });
}

export default plugin;