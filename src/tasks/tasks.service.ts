import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService) {}

  async create(createTaskDto: CreateTaskDto, user: any) {

    if(createTaskDto.ownerId && createTaskDto.ownerId !== user.userId && user.role !== 'ADMIN') {
      throw new NotFoundException('You do not have permission to create tasks for other users');
    }

    if(createTaskDto.status === 'ARCHIVED') {
      throw new HttpException('Cannot create task with status ARCHIVED', 401);
    }

    const ownerId = createTaskDto.ownerId || user.userId;
    const owner = await this.prisma.user.findUnique({
      where: { id: ownerId },
    });

    if (!owner) {
      throw new NotFoundException(`User with ID ${ownerId} not found`);
    }

    const data = {
    ...createTaskDto,
    ownerId: ownerId
    };


    const task = this.prisma.task.create({
      data: data,
    });

    return task;
  }

  findAll(user: any) {
    const userId = user.userId;
    if (!userId) {
      throw new NotFoundException('User not found');
    }
    if(user.role === 'ADMIN') {
      return this.prisma.task.findMany();
    }
    return this.prisma.task.findMany({
      where: { ownerId: userId },
    });
  }

  getTasksFromUser(userId: number) {
    if (isNaN(userId) || userId <= 0) {
      throw new NotFoundException('Invalid user ID');
    }
    return this.prisma.task.findMany({
      where: { ownerId: userId },
    });
  }

  findOne(id: number) {
    try{
      const task = this.prisma.task.findUnique({
        where: { id },
      });
      if (!task) {
        throw new NotFoundException(`Task with ID ${id} not found`);
      }
      console.log(`Found task with ID ${id}:`, task);
      return task;
    }catch (error) {
      console.error('Error finding task:', error);
      throw new NotFoundException('Task not found');
    }
  }

  update(id: number, updateTaskDto: UpdateTaskDto) {
    const task = this.prisma.task.findUnique({
      where: { id },
    });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    if (updateTaskDto.status === 'ARCHIVED') {
      throw new HttpException('Cannot update task to status ARCHIVED', 401);
    }

    return this.prisma.task.update({
      where: { id },
      data: updateTaskDto,
    });
  }

  archive(id: number) {
    const task = this.prisma.task.findUnique({
      where: { id },
    });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return this.prisma.task.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });
  }

  remove(id: number) {
    const task = this.prisma.task.findUnique({
      where: { id },
    });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return this.prisma.task.delete({
      where: { id },
    });
  }
}
