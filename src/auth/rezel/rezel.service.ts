/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */
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
  name: string;
  preferred_username: string;
}

/** Flow OAuth2 avec Rezel : URL d'autorisation, échange du code, profil. */
@Injectable()
export class RezelService {
  private readonly logger = new Logger(RezelService.name);

  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async getAuthorizationUrl(): Promise<{ url: string }> {
    /* Génère une URL d'autorisation Rezel */
    const state = crypto.randomBytes(16).toString('hex');
    const scopes = ['openid', 'profile', 'email'].join(' ');

    await (this.cacheManager as any).set(`state:${state}`, true, 1000 * 60 * 5);

    const url =
      `${env.REZEL_AUTH_URL}` +
      `?response_type=code` +
      `&client_id=${encodeURIComponent(env.REZEL_CLIENT_ID)}` +
      `&redirect_uri=${encodeURIComponent(env.REZEL_CALLBACK_URL)}` +
      `&scope=${encodeURIComponent(scopes)}` +
      `&state=${encodeURIComponent(state)}`;

    return { url };
  }

  async exchangeCode(code: string, state: string): Promise<string> {
    /* Échange le code d'autorisation contre un token d'accès */
    const valid = await (this.cacheManager as any).get(`state:${state}`);

    if (!valid) {
      throw new UnauthorizedException('Invalid or expired state parameter');
    }

    await (this.cacheManager as any).del(`state:${state}`);

    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'authorization_code');
      params.append('code', code);
      params.append('redirect_uri', env.REZEL_CALLBACK_URL);
      params.append('client_id', env.REZEL_CLIENT_ID);
      params.append('client_secret', env.REZEL_CLIENT_SECRET);

      const response = await this.httpService.axiosRef.post<RezelTokenResponse>(
        env.REZEL_TOKEN_URL,
        params,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );

      return response.data.access_token;
    } catch (e) {
      this.logger.error(
        `Failed to exchange code with Rezel: ${getErrorMessage(e)}`,
        getErrorStack(e),
      );
      throw new InternalServerErrorException();
    }
  }

  async getUserInfo(accessToken: string): Promise<RezelUserProfile> {
    /* Récupère le profil de l'utilisateur depuis Rezel */
    try {
      const response = await this.httpService.axiosRef.get<RezelUserProfile>(
        env.REZEL_USERINFO_URL,
        { headers: { Authorization: `Bearer ${accessToken}` } },
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
