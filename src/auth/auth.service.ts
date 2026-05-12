import { Injectable } from '@nestjs/common';
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
    const accessToken = await this.rezelService.exchangeCode(code, state);
    const profile = await this.rezelService.getUserInfo(accessToken);

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
