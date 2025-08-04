import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TaskCleanerService {
  private readonly logger = new Logger(TaskCleanerService.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    const result = await this.prisma.task.deleteMany({
      where: {
        deletedAt: { lt: new Date() },
        status: { not: 'ARCHIVED' },
      },
    });
    this.logger.log(`Tareas expiradas eliminadas: ${result.count}`);
  }
}
