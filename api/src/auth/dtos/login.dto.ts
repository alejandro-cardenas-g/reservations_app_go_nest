import { IsIn, IsString } from 'class-validator';
import { OAuthProvider } from '../types/oauthProviders.type';

export class LoginDto {
  @IsString()
  @IsIn(['github', 'google'] satisfies OAuthProvider[])
  provider: OAuthProvider;
}
