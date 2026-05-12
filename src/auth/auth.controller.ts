import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';

import { JwtAuthGuard } from './jwt-auth.guard';

import { AuthService } from './auth.service';
import { LoginUrlDto } from './dto/auth-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('login')
  @ApiOkResponse({ type: LoginUrlDto })
  async login(): Promise<LoginUrlDto> {
    return this.authService.getAuthorizationUrl();
  }

  @Get('callback')
  @ApiQuery({ name: 'code', type: String })
  @ApiQuery({ name: 'state', type: String })
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ): Promise<void> {
    const { access_token } = await this.authService.handleCallback(code, state);

    res.cookie('token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000,
    });

    res.redirect(`${process.env.FRONTEND_URL ?? 'http://localhost:3001'}/dashboard`);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  me(@Req() req: Request) {
    return this.authService.getMe(req['user'].sub as string);
  }
}
