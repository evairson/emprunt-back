import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AdminGuard } from '../auth/admin.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { env } from '../config/env';
import { EmpruntController } from './emprunt.controller';
import { EmpruntService } from './emprunt.service';

@Module({
  imports: [
    JwtModule.register({
      secret: env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [EmpruntController],
  providers: [EmpruntService, JwtAuthGuard, AdminGuard],
})
export class EmpruntModule {}
