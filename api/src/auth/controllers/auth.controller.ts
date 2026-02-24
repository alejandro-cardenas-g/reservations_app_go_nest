import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Response } from 'express';
import { CallbackDto } from '../dtos/callback.dto';
import { LoginDto } from '../dtos/login.dto';
import { Oauth2Service } from '../services/oauth2.service';
import { CookieAuthGuard } from '../guards/cookieAuth.guard';
import { GetUser } from '@app/common/auth/decorators';
import { AuthUser } from '@app/common/types';

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

  @Get('token')
  async token(
    @Query('state') state: string,
    @Query('code') code: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const payload = plainToInstance(CallbackDto, { code, state });
    const errors = await validate(payload);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const result = await this.oauth2Service.callback(code, payload.state);

    if (!result.isSuccess) throw new UnauthorizedException(result.error);

    this.setRefreshTokenCookie(
      res,
      result.value.refreshToken,
      result.value.refreshTokenExpiresAt,
    );

    return result.value;
  }

  @Get('callback')
  async callback(@Query('state') state: string, @Query('code') code: string) {
    const payload = plainToInstance(CallbackDto, { code, state });
    const errors = await validate(payload);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const url = new URL(this.configService.getOrThrow<string>('HOST_TOKEN'));
    url.searchParams.set('code', code);
    url.searchParams.set('state', state);
    return {
      url: url.toString(),
    };
  }

  @UseGuards(CookieAuthGuard)
  @Put('refresh-token')
  refreshToken(@GetUser() user: AuthUser) {
    const result = this.oauth2Service.refreshToken(user);
    return result;
  }

  @UseGuards(CookieAuthGuard)
  @Delete('logout')
  async logout(
    @GetUser() user: AuthUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    const cookieName =
      this.configService.getOrThrow<string>('COOKIE_AUTH_NAME');
    response.clearCookie(cookieName);
    await this.oauth2Service.signOut(user);
    response.status(204);
    return {};
  }

  private setRefreshTokenCookie(
    res: Response,
    refreshToken: string,
    refreshTokenExpiresAt: Date,
  ) {
    const cookieName =
      this.configService.getOrThrow<string>('COOKIE_AUTH_NAME');
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
