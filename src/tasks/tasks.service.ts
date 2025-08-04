import { HttpException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from '../prisma.service';
import { NotificationsGateway } from 'src/notifications/notifications.gateway';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService, private readonly notificationsGateway: NotificationsGateway) {}

  async create(createTaskDto: CreateTaskDto, user: any) {
    if (createTaskDto.ownerId && createTaskDto.ownerId !== user.userId && user.role !== 'ADMIN') {
      throw new NotFoundException('You do not have permission to create tasks for other users');
    }

    if (createTaskDto.status === 'ARCHIVED') {
      throw new HttpException('Cannot create task with status ARCHIVED', 401);
    }

    const ownerId = createTaskDto.ownerId || user.userId;
    const owner = await this.prisma.user.findUnique({ where: { id: ownerId } });

    if (!owner) {
      throw new NotFoundException(`User with ID ${ownerId} not found`);
    }

    const task = this.prisma.task.create({ data: { ...createTaskDto, ownerId } });

    this.notificationsGateway.notifyTaskCreated(task);

    return task;
  }

  async findAll(user: any, query: any) {
    const { title, type, sortBy = 'createdAt', order = 'desc', page = '1' } = query;
    const where: any = {};

    if (user.role !== 'ADMIN') where.ownerId = user.userId;
    if (title) where.title = { contains: title, mode: 'insensitive' };

    if (type) {
      if (!['URGENT', 'MEDIUM', 'LOW'].includes(type.toUpperCase())) {
        throw new BadRequestException('Invalid task type');
      }
      where.type = type.toUpperCase();
    }

    const validSortFields = ['createdAt', 'updatedAt', 'title'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = order.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const numericPage = parseInt(page);
    if (isNaN(numericPage) || numericPage <= 0) {
      throw new BadRequestException('Invalid page value');
    }

    const take = 10;
    const skip = (numericPage - 1) * take;

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({ where, orderBy: { [sortField]: sortDirection }, skip, take }),
      this.prisma.task.count({ where }),
    ]);

    return {
      data: tasks,
      meta: {
        total,
        page: numericPage,
        pageSize: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async getTasksFromUser(userId: number) {
    if (isNaN(userId) || userId <= 0) {
      throw new NotFoundException('Invalid user ID');
    }
    return this.prisma.task.findMany({ where: { ownerId: userId } });
  }

  async findOne(id: number) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException(`Task with ID ${id} not found`);
    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException(`Task with ID ${id} not found`);

    if (updateTaskDto.status === 'ARCHIVED') {
      throw new HttpException('Cannot update task to status ARCHIVED', 401);
    }

    if(updateTaskDto.ownerId){
      const owner = await this.prisma.user.findUnique({ where: { id: updateTaskDto.ownerId } });
      if (!owner) {
        throw new NotFoundException(`User with ID ${updateTaskDto.ownerId} not found`);
      }
    }

    const updatedTask = await this.prisma.task.update({
      where: { id },
      data: updateTaskDto,
    });

    this.notificationsGateway.notifyTaskUpdated(updatedTask);

    return updatedTask;
  }

  async archive(id: number) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException(`Task with ID ${id} not found`);

    const archivedTask = await this.prisma.task.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });

    this.notificationsGateway.notifyTaskUpdated(archivedTask);

    return archivedTask;
  }

  async remove(id: number) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException(`Task with ID ${id} not found`);

    const deletedTask = await this.prisma.task.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    this.notificationsGateway.notifyTaskDeleted(id);

    return deletedTask;
  }
}
