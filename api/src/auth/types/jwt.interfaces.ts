import { Audience } from '@app/common/types';

export type JwtPayload = {
  sid: string;
  token: string;
  aud: Audience;
};

export type JwtPayloadWithExp = JwtPayload & {
  exp: number;
};
