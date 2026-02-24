import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { User } from './entities/users.entity';
import { Session } from './entities/session.entity';
import { ConfigModule } from '@nestjs/config';
import { Secrets } from './constants/secrets.constant';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { UsersRepository } from './repositories/users.repository';
import { SessionsRepository } from './repositories/sessions.repository';
import { AuthService } from './services/auth.service';
import { UsersService } from './services/users.service';
import { SessionsService } from './services/sessions.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { DatabaseModule } from '@app/common/database/database.module';
import { DB_CONNECTIONS } from '@app/common/configuration/constants';
import { Oauth2Service } from './services/oauth2.service';
import { ManagerProvider } from './services/oauth/manager.provider';
import { GoogleProvider } from './services/oauth/google.provider';
import { GithubProvider } from './services/oauth/github.provider';

@Module({
  imports: [
    DatabaseModule.forFeature(
      DB_CONNECTIONS.MAIN,
      AuthModule.DatabaseModules(),
    ),
    ConfigModule.forRoot({
      load: [Secrets],
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    HttpModule,
  ],
  controllers: [AuthController],
  providers: [
    /** Repositories */
    UsersRepository,
    SessionsRepository,
    /** Services */
    AuthService,
    UsersService,
    SessionsService,
    Oauth2Service,
    ManagerProvider,
    GoogleProvider,
    GithubProvider,
    /** auth classes */
    JwtStrategy,
  ],
})
export class AuthModule {
  static DatabaseModules() {
    return [User, Session];
  }
}
