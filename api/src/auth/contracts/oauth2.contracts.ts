import { TResult } from '@app/common/classes';

export type OAuthUserInfo = {
  email: string;
};

export interface IOauthProvider {
  getLoginUrl(): string;
  getAccessToken(code: string): Promise<TResult<string>>;
  getUserInfo(accessToken: string): Promise<TResult<OAuthUserInfo>>;
}
