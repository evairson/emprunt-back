import { Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch(':id/admin')
  // ATTENTION : ici pour simplifier le test du site, n'importe quel utilisateur peut devenir admin
  // en temps normal il faudrait restreindre cette route à certains utilisateurs déjà admin ou à un superadmin
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  makeAdmin(@Param('id') id: string) {
    return this.usersService.makeAdmin(id);
  }
}
