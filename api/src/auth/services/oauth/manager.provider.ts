import { Result, TResult } from '@app/common/classes';
import { Injectable } from '@nestjs/common';
import { IOauthProviderStrategy } from '../../contracts/oauth2.contracts';
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
  private strategies: Map<OAuthProvider, IOauthProviderStrategy>;
  constructor(googleProvider: GoogleProvider, githubProvider: GithubProvider) {
    this.strategies = new Map();
    this.strategies.set('google', googleProvider);
    this.strategies.set('github', githubProvider);
  }

  getProvider(provider: OAuthProvider): TResult<IOauthProviderStrategy> {
    const strategy = this.strategies.get(provider);
    if (!strategy) return Result.Failure('Unknown provider', 'INVALID_ERROR');
    return Result.Success(strategy);
  }
}
