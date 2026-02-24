import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from '../dtos/login.dto';
import { Oauth2Service } from '../services/oauth2.service';
import { CallbackDto } from '../dtos/callback.dto';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(
    private readonly oauth2Service: Oauth2Service,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  login(@Body() body: LoginDto) {
    const { provider } = body;
    const result = this.oauth2Service.login(provider);

    if (!result.isSuccess) throw new UnauthorizedException(result.error);

    return { url: result.value };
  }

  @Get('callback')
  async callback(
    @Query() query: CallbackDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { code, state } = query;
    const result = await this.oauth2Service.callback(code, state);

    if (!result.isSuccess) throw new UnauthorizedException(result.error);

    this.setRefreshTokenCookie(
      res,
      result.value.refreshToken,
      result.value.refreshTokenExpiresAt,
    );

    return { tokens: result.value };
  }

  private setRefreshTokenCookie(
    res: Response,
    refreshToken: string,
    refreshTokenExpiresAt: Date,
  ) {
    const cookieName = this.configService.getOrThrow<string>('COOKIE_NAME');
    const isProduction =
      this.configService.getOrThrow<string>('NODE_ENV') === 'production';
    res.cookie(cookieName, refreshToken, {
      httpOnly: true,
      expires: refreshTokenExpiresAt,
      sameSite: isProduction ? 'none' : undefined,
      secure: isProduction,
    });
  }
}
