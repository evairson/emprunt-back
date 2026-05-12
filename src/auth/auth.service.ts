import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users/users.service';
import { RezelService } from './rezel/rezel.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly rezelService: RezelService,
    private readonly usersService: UsersService,
  ) {}

  getMe(id: string) {
    return this.usersService.findById(id);
  }

  getAuthorizationUrl() {
    return this.rezelService.getAuthorizationUrl();
  }

  async handleCallback(code: string, state: string) {
    const accessToken = await this.rezelService.exchangeCode(code, state);
    const profile = await this.rezelService.getUserInfo(accessToken);

    await this.usersService.findOrCreate({
      id: profile.sub,
      email: profile.email,
      username: profile.preferred_username,
    });

    return {
      access_token: this.jwtService.sign({
        sub: profile.sub,
        email: profile.email,
        username: profile.preferred_username,
      }),
    };
  }
}
