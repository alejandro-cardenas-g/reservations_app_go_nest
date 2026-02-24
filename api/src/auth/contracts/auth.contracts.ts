import { AuthUser } from '@app/common/types';

export type AuthUserWithoutSession = Omit<AuthUser, 'session'>;

export interface GetAuthAccessTokensResult {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

export interface AccessTokenResult {
  accessToken: string;
}
