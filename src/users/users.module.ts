import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
   exports: [UsersService]
})
export class UsersModule {}
