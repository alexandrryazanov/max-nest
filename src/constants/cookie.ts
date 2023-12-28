import { CookieOptions } from 'express-serve-static-core';

export const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  sameSite: 'none',
  secure: true,
};
