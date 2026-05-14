import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';

export class CreateEmpruntDto {
  materialId!: string;
  startDate!: string;
  endDate!: string;
}

/** Emprunt : création, chevauchements, validation, retour, rappels mail. */
@Injectable()
export class EmpruntService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

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
    const emprunt = await this.prisma.client.emprunt.findUnique({
      where: { id },
      include: { user: true, material: true },
    });
    if (!emprunt) throw new NotFoundException('Emprunt not found');
    if (emprunt.status !== 'PENDING') {
      throw new BadRequestException('Emprunt already processed');
    }

    const updated = await this.prisma.client.emprunt.update({
      where: { id },
      data: { status },
    });

    if (status === 'APPROVED') {
      const due = emprunt.endDate.toLocaleDateString('fr-FR');
      await this.mail.send(
        emprunt.user.email,
        `Demande d'emprunt acceptée : ${emprunt.material.name}`,
        `Bonjour ${emprunt.user.name},\n\nVotre demande d'emprunt pour "${emprunt.material.name}" a été acceptée.\nMerci de rendre le matériel avant le ${due}.\n\nTotally Sport!`,
      );
    } else {
      await this.mail.send(
        emprunt.user.email,
        `Demande d'emprunt refusée : ${emprunt.material.name}`,
        `Bonjour ${emprunt.user.name},\n\nVotre demande d'emprunt pour "${emprunt.material.name}" a été refusée.\n\nTotally Sport!`,
      );
    }

    return updated;
  }

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async sendReturnReminders() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const dueToday = await this.prisma.client.emprunt.findMany({
      where: {
        status: 'APPROVED',
        returnedAt: null,
        endDate: { gte: todayStart, lt: todayEnd },
      },
      include: { user: true, material: true },
    });

    for (const e of dueToday) {
      await this.mail.send(
        e.user.email,
        `Rappel : retour du matériel "${e.material.name}" aujourd'hui`,
        `Bonjour ${e.user.name},\n\nLa date de retour pour "${e.material.name}" est aujourd'hui. Merci de le rapporter au BDS.\n\nTotally Sport!`,
      );
    }
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
