// src/auth/guards/task-owner.guard.ts
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { TasksService } from 'src/tasks/tasks.service';
import { JwtUserInterface } from '../interfaces/jwt-user.interface';

@Injectable()
export class TaskOwnerGuard implements CanActivate {
  constructor(private readonly tasksService: TasksService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as JwtUserInterface;
    const taskId = parseInt(request.params.id, 10);

    if (!user || isNaN(taskId)) {
      throw new ForbiddenException('Access denied');
    }

    const task = await this.tasksService.findOne(taskId);

    if (!task) {
      throw new ForbiddenException('Task not found');
    }

    if (task.ownerId !== user.userId && user.role !== 'ADMIN') {
      throw new ForbiddenException('You do not have permission to access this task');
    }

    return true;
  }
}
