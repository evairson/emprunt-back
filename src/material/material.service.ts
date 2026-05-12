import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MaterialService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.client.material.findMany();
  }
}
