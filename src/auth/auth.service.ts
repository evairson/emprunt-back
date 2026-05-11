<<<<<<< HEAD
import { Injectable, UnauthorizedException } from '@nestjs/common';
=======
import { Injectable } from '@nestjs/common';
>>>>>>> 67175a2 (mise en place de la route auth de login avec jwt. récupération du token et envoie du token au front avec le callback)
import { JwtService } from '@nestjs/jwt';

import { RezelService } from './rezel/rezel.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly rezelService: RezelService,
  ) {}

  getAuthorizationUrl() {
    return this.rezelService.getAuthorizationUrl();
  }

  async handleCallback(code: string, state: string) {
    const { accessToken, nonce } = await this.rezelService.exchangeCode(
      code,
      state,
    );
    const profile = await this.rezelService.getUserInfo(accessToken);

    if (profile.nonce !== nonce) {
      throw new UnauthorizedException('Nonce mismatch');
    }

    return {
      access_token: this.jwtService.sign({
        sub: profile.sub,
        email: profile.email,
        username: profile.preferred_username,
        groups: profile.groups,
      }),
    };
  }
}
