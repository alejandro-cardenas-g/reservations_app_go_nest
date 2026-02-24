import { Injectable, Logger } from '@nestjs/common';
import { IOauthProvider } from '../../contracts/oauth2.contracts';
import { OAuthProvider } from '../../types/oauthProviders.type';
import { GithubProvider } from './github.provider';
import { GoogleProvider } from './google.provider';

/**
 * Factory that returns the OAuth strategy (provider) for the given provider key.
 * Strategy pattern: IOauthProvider implementations (Google, Github) are interchangeable.
 * Factory pattern: this class selects and returns the correct strategy by key.
 */
@Injectable()
export class ManagerProvider {
  private readonly logger = new Logger(ManagerProvider.name);
  constructor(
    private readonly googleProvider: GoogleProvider,
    private readonly githubProvider: GithubProvider,
  ) {}

  getProvider(provider: OAuthProvider): IOauthProvider | null {
    switch (provider) {
      case 'google':
        return this.googleProvider;
      case 'github':
        return this.githubProvider;
      default: {
        this.logger.error('Unknown OAuth provider');
        return null;
      }
    }
  }
}
