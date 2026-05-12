import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { EmpruntModule } from './emprunt/emprunt.module';
import { MaterialModule } from './material/material.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    MaterialModule,
    EmpruntModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
