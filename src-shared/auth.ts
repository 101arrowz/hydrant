import { z } from "zod";

// These help the frontend read cookie info from the backend
export const LOGIN_COOKIE_NAME = 'fireroad_login';
export const loginCookieInfo = z.object({
  userId: z.string(),
  until: z.number()
});
