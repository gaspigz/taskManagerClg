import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { TaskCleanerService } from './tasks-cleaner.service';

@Module({
  controllers: [TasksController],
  providers: [TaskCleanerService, TasksService, PrismaService, JwtService],
})
export class TasksModule {}
