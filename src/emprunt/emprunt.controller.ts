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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { AdminGuard } from '../auth/admin.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateEmpruntDto, EmpruntService } from './emprunt.service';

/** Routes d'emprunt : demande, validation, retour. */
@ApiTags('emprunt')
@ApiBearerAuth()
@Controller('emprunt')
@UseGuards(JwtAuthGuard)
export class EmpruntController {
  constructor(private readonly empruntService: EmpruntService) {}

  @Post()
  @ApiOperation({ summary: "Crée une demande d'emprunt" })
  create(@Req() req: Request, @Body() dto: CreateEmpruntDto) {
    return this.empruntService.create(req['user'].sub as string, dto);
  }

  @Get('mine')
  @ApiOperation({ summary: 'Mes demandes' })
  findMine(@Req() req: Request) {
    return this.empruntService.findMine(req['user'].sub as string);
  }

  @Get('blocked/:materialId')
  @ApiOperation({ summary: 'Plages bloquées d\'un matériel (calendrier)' })
  blockedDates(@Param('materialId') materialId: string) {
    return this.empruntService.getBlockedDates(materialId);
  }

  @Get()
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Toutes les demandes (admin)' })
  findAll() {
    return this.empruntService.findAll();
  }

  @Patch(':id/approve')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Approuve une demande + mail (admin)' })
  approve(@Param('id') id: string) {
    return this.empruntService.setStatus(id, 'APPROVED');
  }

  @Patch(':id/reject')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Refuse une demande + mail (admin)' })
  reject(@Param('id') id: string) {
    return this.empruntService.setStatus(id, 'REJECTED');
  }

  @Patch(':id/return')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Marque le matériel comme rendu (admin)' })
  markReturned(@Param('id') id: string) {
    return this.empruntService.markReturned(id);
  }
}
