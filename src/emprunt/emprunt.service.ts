import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

export class CreateEmpruntDto {
  materialId!: string;
  startDate!: string;
  endDate!: string;
}

@Injectable()
export class EmpruntService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateEmpruntDto) {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      throw new BadRequestException('Invalid date range');
    }

    const material = await this.prisma.client.material.findUnique({
      where: { id: dto.materialId },
    });
    if (!material) throw new NotFoundException('Material not found');

    const overlap = await this.prisma.client.emprunt.findFirst({
      where: {
        materialId: dto.materialId,
        status: 'APPROVED',
        returnedAt: null,
        startDate: { lt: end },
        endDate: { gt: start },
      },
      orderBy: { endDate: 'asc' },
    });
    if (overlap) {
      throw new BadRequestException(
        `Material unavailable until ${overlap.endDate.toISOString()}`,
      );
    }

    return this.prisma.client.emprunt.create({
      data: { userId, materialId: dto.materialId, startDate: start, endDate: end },
    });
  }

  getBlockedDates(materialId: string) {
    return this.prisma.client.emprunt.findMany({
      where: {
        materialId,
        status: 'APPROVED',
        returnedAt: null,
        endDate: { gte: new Date() },
      },
      select: { startDate: true, endDate: true },
      orderBy: { startDate: 'asc' },
    });
  }

  findAll() {
    return this.prisma.client.emprunt.findMany({
      include: { material: true, user: true },
    });
  }

  findMine(userId: string) {
    return this.prisma.client.emprunt.findMany({
      where: { userId },
      include: { material: true },
    });
  }

  async setStatus(id: string, status: 'APPROVED' | 'REJECTED') {
    const emprunt = await this.prisma.client.emprunt.findUnique({ where: { id } });
    if (!emprunt) throw new NotFoundException('Emprunt not found');
    if (emprunt.status !== 'PENDING') {
      throw new BadRequestException('Emprunt already processed');
    }

    return this.prisma.client.emprunt.update({ where: { id }, data: { status } });
  }

  async markReturned(id: string) {
    const emprunt = await this.prisma.client.emprunt.findUnique({ where: { id } });
    if (!emprunt) throw new NotFoundException('Emprunt not found');
    if (emprunt.status !== 'APPROVED') {
      throw new BadRequestException('Emprunt is not approved');
    }
    if (emprunt.returnedAt) {
      throw new BadRequestException('Emprunt already returned');
    }

    return this.prisma.client.emprunt.update({
      where: { id },
      data: { returnedAt: new Date() },
    });
  }
}
