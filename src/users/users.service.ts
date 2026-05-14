import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

export class FindOrCreateUserDto {
  id!: string;
  email!: string;
  username!: string;
  name!: string;
}

/** Gestion des utilisateurs */
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreate(dto: FindOrCreateUserDto) {
    return this.prisma.client.user.upsert({
      where: { id: dto.id },
      update: {},
      create: dto,
    });
  }

  async findById(id: string) {
    return this.prisma.client.user.findUnique({ where: { id } });
  }

  async makeAdmin(id: string) {
    const user = await this.prisma.client.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.client.user.update({
      where: { id },
      data: { role: 'ADMIN' },
    });
  }
}
