import { FastifyPluginAsync, FastifyReply, FastifyRequest, onRequestAsyncHookHandler } from "fastify";
import { ZodError, z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import makePlugin from "fastify-plugin";
import { LOGIN_COOKIE_NAME, loginCookieInfo } from "~/src-shared/auth";

class AuthError extends Error {
  readonly statusCode = 401;
  readonly type = 'auth';
  constructor (message: string) {
    super(message);
  }
}

const fireroadUserInfo = z.object({
  username: z.string(),
  access_token: z.string(),
  academic_id: z.string()
});

const fireroadTokenResponse = z.object({
  success: z.literal(true),
  access_info: fireroadUserInfo
});

const fireroadJwtHeader = z.object({
  alg: z.literal("HS256"),
  typ: z.literal("JWT")
});

const fireroadJwtPayload = z.object({
  username: z.string(),
  iss: z.literal("com.base12innovations.fireroad-server"),
  expires: z.string().transform(str => {
    // Python loves its nonstandard behavior... fix ISO 8601
    const [date, time] = str.split(' ');
    const fixedTime = time.replace(/\+00:00$/, 'Z');
    return `${date}T${fixedTime}`
  }).pipe(z.coerce.date())
});

const fireroadJwt = z.string().transform(raw => {
  const [hdr, pay, sgn] = raw.split('.');
  try {
    const header = fireroadJwtHeader.parse(JSON.parse(Buffer.from(hdr, "base64url").toString()));
    const payload = fireroadJwtPayload.parse(JSON.parse(Buffer.from(pay, "base64url").toString()));
    const signature = Buffer.from(sgn, "base64url");
    if (signature.length !== 32) {
      throw new TypeError("invalid signature");
    }
    return { header, payload, signature, raw };
  } catch (err) {
    if (err instanceof ZodError) {
      throw err;
    }
    throw ZodError.create([{
      code: 'custom',
      message: err instanceof Error ? err.message : 'unknown',
      path: []
    }]);
  }
});

const fireroadJwtCookie = fireroadJwt.optional();
const fireroadJwtAuthHeader = z
  .string()
  .startsWith("Bearer ")
  .transform(s => s.slice(7))
  .pipe(fireroadJwt)
  .optional();


declare module "fastify" {
  interface FastifyRequest {
    fireroadToken?: z.infer<typeof fireroadJwt> | null;
  }
}

// Wrap in fastify-plugin to enable decorators
export const fireroadAuth = makePlugin(async (instance, options: { optional?: boolean; verify?: boolean; }) => {
  instance.decorateRequest('fireroadToken', null);
  instance.addHook('preHandler', async (req, res) => {
    const token = fireroadJwtAuthHeader.parse(req.headers.authorization) ||
      fireroadJwtCookie.parse(req.cookies.fireroad_token) ||
      null;

    if (!token && !options.optional) {
      throw new AuthError('no fireroad token provided');
    }

    if (token && options.verify) {
      const target = new URL('/user_info', process.env.FIREROAD_API_BASE);
      const infoRes = await fetch(target, { headers: { authorization: `Bearer ${token.raw}` } });
      if (!infoRes.ok) {
        throw new AuthError('invalid credentials');
      }
      const freshInfo = fireroadUserInfo.parse(await infoRes.json());
      if (token.payload.username !== freshInfo.username) {
        throw new AuthError('failed to verify login');
      }
    }

    req.fireroadToken = token;
  });
});

const safeRedirect = z.custom<string>(data =>
  typeof data === 'string' &&
  new URL(data, process.env.SITE).origin === process.env.SITE
).optional();

const authPlugin: FastifyPluginAsync = async auth => {
  auth.withTypeProvider<ZodTypeProvider>()
    .get('/login', {
      schema: {
        querystring: z.object({
          redirect: safeRedirect
        })
      }
    }, async (req, res) => {
      const postLogin = new URL('/api/auth/loggedin', process.env.SITE);
      if (req.query.redirect) {
        postLogin.searchParams.append('next', req.query.redirect);
      }

      const target = new URL('/login', process.env.FIREROAD_API_BASE);      
      target.searchParams.append('redirect', postLogin.href);
      res.redirect(target.href);
    })
    .get('/loggedin', {
      schema: {
        querystring: z.object({
          code: z.string(),
          next: safeRedirect
        })
      }
    }, async (req, res) => {
      const target = new URL('/fetch_token', process.env.FIREROAD_API_BASE);
      target.searchParams.append('code', req.query.code);
      const tokenRes = await fetch(target);
  
      if (!tokenRes.ok) {
        throw new AuthError('failed to get fireroad token');
      }

      const authResult = fireroadTokenResponse.parse(await tokenRes.json());
      const accessToken = authResult.access_info.access_token;
      const jwt = fireroadJwt.parse(accessToken);

      const loginInfo: z.infer<typeof loginCookieInfo> = {
        userId: authResult.access_info.academic_id,
        until: +jwt.payload.expires
      };

      // We delegate authentication to FireRoad, so no need to create our own JWTs.
      // We just need to make sure we check that supplied tokens are unexpired when e.g. updating schedules.
      // That's pretty much free since we need to call into FireRoad anyway at that point - the only reason
      // we have a backend at all is to patch around things FireRoad is missing.
      res.setCookie('fireroad_token', authResult.access_info.access_token, {
        secure: true,
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        expires: jwt.payload.expires
        // Doesn't need to be signed - JWTs have a signature built-in
      });
      res.setCookie(LOGIN_COOKIE_NAME, JSON.stringify(loginInfo), {
        secure: true,
        // This info is specifically for the client to read
        httpOnly: false,
        sameSite: 'lax',
        path: '/',
        expires: jwt.payload.expires
      });
      res.redirect(req.query.next ?? '/');
    })
}

const plugin: FastifyPluginAsync = async api => {
  await api.register(authPlugin, {
    prefix: '/auth'
  });
}

export default plugin;