import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const userId = (req['user'] as { sub?: string })?.sub;
    if (!userId) throw new ForbiddenException();

    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
    });
    if (user?.role !== 'ADMIN') throw new ForbiddenException('Admin only');

    return true;
  }
}
