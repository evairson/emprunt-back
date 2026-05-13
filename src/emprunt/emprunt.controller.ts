import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { AdminGuard } from '../auth/admin.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateEmpruntDto, EmpruntService } from './emprunt.service';

@ApiTags('emprunt')
@ApiBearerAuth()
@Controller('emprunt')
@UseGuards(JwtAuthGuard)
export class EmpruntController {
  constructor(private readonly empruntService: EmpruntService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateEmpruntDto) {
    return this.empruntService.create(req['user'].sub as string, dto);
  }

  @Get('mine')
  findMine(@Req() req: Request) {
    return this.empruntService.findMine(req['user'].sub as string);
  }

  @Get('blocked/:materialId')
  blockedDates(@Param('materialId') materialId: string) {
    return this.empruntService.getBlockedDates(materialId);
  }

  @Get()
  @UseGuards(AdminGuard)
  findAll() {
    return this.empruntService.findAll();
  }

  @Patch(':id/approve')
  @UseGuards(AdminGuard)
  approve(@Param('id') id: string) {
    return this.empruntService.setStatus(id, 'APPROVED');
  }

  @Patch(':id/reject')
  @UseGuards(AdminGuard)
  reject(@Param('id') id: string) {
    return this.empruntService.setStatus(id, 'REJECTED');
  }

  @Patch(':id/return')
  @UseGuards(AdminGuard)
  markReturned(@Param('id') id: string) {
    return this.empruntService.markReturned(id);
  }
}
