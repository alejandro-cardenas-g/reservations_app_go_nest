import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { OAuthProvider } from '../types/oauthProviders.type';

export class CallbackDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsIn(['google', 'github'] satisfies OAuthProvider[])
  state: OAuthProvider;
}
