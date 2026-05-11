<<<<<<< HEAD
/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
=======
/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */
>>>>>>> 67175a2 (mise en place de la route auth de login avec jwt. récupération du token et envoie du token au front avec le callback)
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import type { Cache } from 'cache-manager';
import * as crypto from 'crypto';

import { env } from 'src/config/env';

import {
  getErrorMessage,
  getErrorStack,
} from '../../common/utils/error-handling';

interface RezelTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

export interface RezelUserProfile {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  given_name: string;
  preferred_username: string;
  nickname: string;
  groups: string[];
<<<<<<< HEAD
  nonce: string;
=======
>>>>>>> 67175a2 (mise en place de la route auth de login avec jwt. récupération du token et envoie du token au front avec le callback)
}

@Injectable()
export class RezelService {
  private readonly logger = new Logger(RezelService.name);

  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

<<<<<<< HEAD
  async getAuthorizationUrl(): Promise<{
    url: string;
    codeVerifier: string;
    state: string;
    nonce: string;
  }> {
    const codeVerifier = crypto.randomBytes(32).toString('hex');
    const sha256 = crypto.createHash('sha256').update(codeVerifier).digest();
    const codeChallenge = sha256.toString('base64url');
    const state = crypto.randomBytes(16).toString('hex');
    const nonce = crypto.randomBytes(16).toString('hex');
    const scopes = ['openid', 'profile', 'email', 'offline_access'].join(' ');

    await this.cacheManager.set(
      `pkce:${state}`,
      { codeVerifier, nonce },
      1000 * 60 * 5,
    );

    const inner =
=======
  async getAuthorizationUrl(): Promise<{ url: string }> {
    const state = crypto.randomBytes(16).toString('hex');
    const scopes = ['openid', 'profile', 'email'].join(' ');

    await (this.cacheManager as any).set(`state:${state}`, true, 1000 * 60 * 5);

    const url =
>>>>>>> 67175a2 (mise en place de la route auth de login avec jwt. récupération du token et envoie du token au front avec le callback)
      `${env.REZEL_AUTH_URL}` +
      `?response_type=code` +
      `&client_id=${encodeURIComponent(env.REZEL_CLIENT_ID)}` +
      `&redirect_uri=${encodeURIComponent(env.REZEL_CALLBACK_URL)}` +
      `&scope=${encodeURIComponent(scopes)}` +
<<<<<<< HEAD
      `&state=${encodeURIComponent(state)}` +
      `&nonce=${encodeURIComponent(nonce)}` +
      `&code_challenge=${encodeURIComponent(codeChallenge)}` +
      `&code_challenge_method=S256`;

    return {
      url: inner,
      codeVerifier,
      state,
      nonce,
    };
  }

  async exchangeCode(
    code: string,
    state: string,
  ): Promise<{ accessToken: string; nonce: string }> {
    const cached = (await (this.cacheManager as any).get(`pkce:${state}`)) as {
      codeVerifier: string;
      nonce: string;
    } | null;

    if (!cached?.codeVerifier) {
      throw new UnauthorizedException('Invalid or expired state parameter');
    }

=======
      `&state=${encodeURIComponent(state)}`;

    return { url };
  }

  async exchangeCode(code: string, state: string): Promise<string> {
    const valid = await (this.cacheManager as any).get(`state:${state}`);

    if (!valid) {
      throw new UnauthorizedException('Invalid or expired state parameter');
    }

    await (this.cacheManager as any).del(`state:${state}`);

>>>>>>> 67175a2 (mise en place de la route auth de login avec jwt. récupération du token et envoie du token au front avec le callback)
    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'authorization_code');
      params.append('code', code);
<<<<<<< HEAD
      params.append('code_verifier', cached.codeVerifier);
=======
>>>>>>> 67175a2 (mise en place de la route auth de login avec jwt. récupération du token et envoie du token au front avec le callback)
      params.append('redirect_uri', env.REZEL_CALLBACK_URL);
      params.append('client_id', env.REZEL_CLIENT_ID);
      params.append('client_secret', env.REZEL_CLIENT_SECRET);

      const response = await this.httpService.axiosRef.post<RezelTokenResponse>(
        env.REZEL_TOKEN_URL,
        params,
<<<<<<< HEAD
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      await this.cacheManager.del(`pkce:${state}`);

      return { accessToken: response.data.access_token, nonce: cached.nonce };
=======
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );

      return response.data.access_token;
>>>>>>> 67175a2 (mise en place de la route auth de login avec jwt. récupération du token et envoie du token au front avec le callback)
    } catch (e) {
      this.logger.error(
        `Failed to exchange code with Rezel: ${getErrorMessage(e)}`,
        getErrorStack(e),
      );
      throw new InternalServerErrorException();
    }
  }

  async getUserInfo(accessToken: string): Promise<RezelUserProfile> {
    try {
      const response = await this.httpService.axiosRef.get<RezelUserProfile>(
        env.REZEL_USERINFO_URL,
<<<<<<< HEAD
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
=======
        { headers: { Authorization: `Bearer ${accessToken}` } },
>>>>>>> 67175a2 (mise en place de la route auth de login avec jwt. récupération du token et envoie du token au front avec le callback)
      );

      return response.data;
    } catch (e) {
      this.logger.error(
        `Failed to get user info: ${getErrorMessage(e)}`,
        getErrorStack(e),
      );
      throw new InternalServerErrorException();
    }
  }
}
