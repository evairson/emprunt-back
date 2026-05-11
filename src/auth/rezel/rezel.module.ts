import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';

import { RezelService } from './rezel.service';

@Module({
  imports: [HttpModule, CacheModule.register()],
  providers: [RezelService],
  exports: [RezelService],
})
export class RezelModule {}
