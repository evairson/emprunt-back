import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MaterialService } from './material.service';

@ApiTags('material')
@Controller('material')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAll() {
    return this.materialService.findAll();
  }
}
