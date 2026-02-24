import { readFileSync } from 'fs';
import { resolve } from 'path';

export const Secrets = () => ({
  secrets: {
    accessToken: {
      privateKey: readFileSync(
        resolve(`${process.env.SECRET_ACCESS}/private.pem`),
        'utf-8',
      ),
      publicKey: readFileSync(
        resolve(`${process.env.SECRET_ACCESS}/public.pem`),
        'utf-8',
      ),
    },
    refreshToken: {
      privateKey: readFileSync(
        resolve(`${process.env.SECRET_REFRESH}/private.pem`),
        'utf-8',
      ),
      publicKey: readFileSync(
        resolve(`${process.env.SECRET_REFRESH}/public.pem`),
        'utf-8',
      ),
    },
  },
  cookieName: process.env.COOKIE_AUTH_NAME || 'sId',
});
