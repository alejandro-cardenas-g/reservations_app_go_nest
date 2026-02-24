import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from '../dtos/login.dto';
import { Oauth2Service } from '../services/oauth2.service';
import { CallbackDto } from '../dtos/callback.dto';

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly oauth2Service: Oauth2Service) {}

  @Post('login')
  login(@Body() body: LoginDto) {
    const { provider } = body;
    const result = this.oauth2Service.login(provider);

    if (!result.isSuccess) throw new UnauthorizedException(result.error);

    return { url: result.value };
  }

  @Get('callback')
  async callback(@Query() query: CallbackDto) {
    const { code, state } = query;
    const result = await this.oauth2Service.callback(code, state);

    if (!result.isSuccess) throw new UnauthorizedException(result.error);

    return { tokens: result.value };
  }
}
