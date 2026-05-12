import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

export class CreateUserDto {
  id!: string;
  email!: string;
  username!: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.client.user.findUnique({
      where: { id: dto.id },
    });
    if (existing) throw new ConflictException('User already exists');

    return this.prisma.client.user.create({ data: dto });
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
