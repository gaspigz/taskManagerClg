import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TaskStatus, TaskType } from '@prisma/client';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

const mockJwtService = {
  sign: jest.fn(() => 'fake-token'),
  verify: jest.fn(),
};

const mockNotificationsGateway = {
  notifyTaskCreated: jest.fn(),
  notifyTaskUpdated: jest.fn(),
  notifyTaskDeleted: jest.fn(),
  notifyTaskArchived: jest.fn(),
};

const mockPrismaService = {
  task: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  }
};

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: NotificationsGateway, useValue: mockNotificationsGateway },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create()', () => {
    it('should create a task for the current user', async () => {
      const user = { userId: 1, role: 'USER' };
      const dto = {
        title: 'New Task',
        description: 'Test',
        type: TaskType.LOW,
        status: TaskStatus.PENDING
      };

      mockPrismaService.user.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaService.task.create.mockResolvedValue({ id: 1, ...dto });

      const result = await service.create(dto, user);

      expect(result).toEqual({ id: 1, ...dto });
      expect(mockPrismaService.task.create).toHaveBeenCalledWith({
        data: { ...dto, ownerId: 1 }
      });
    });

    it('should throw if status is ARCHIVED', async () => {
      await expect(service.create({ title: 't', description: 'd', type: TaskType.LOW, status: TaskStatus.ARCHIVED }, { userId: 1, role: 'USER' }))
        .rejects.toThrow();
    });
  });

  describe('findAll()', () => {
    it('should return tasks for user', async () => {
      mockPrismaService.task.findMany.mockResolvedValue([{ id: 1, title: 'a' }]);
      mockPrismaService.task.count.mockResolvedValue(1);

      const result = await service.findAll({ role: 'USER', userId: 1 }, {});

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should throw for invalid type', async () => {
      await expect(
        service.findAll({ role: 'ADMIN' }, { type: 'INVALID' })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update()', () => {
    it('should update task', async () => {
      const dto = { title: 'Updated' };
      mockPrismaService.task.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaService.task.update.mockResolvedValue({ id: 1, ...dto });

      const result = await service.update(1, dto);

      expect(result.title).toBe('Updated');
    });

    it('should throw if task not found', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(null);
      await expect(service.update(99, { title: 't' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('archive()', () => {
    it('should update task status to ARCHIVED', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaService.task.update.mockResolvedValue({ id: 1, status: 'ARCHIVED' });

      const result = await service.archive(1);
      expect(result.status).toBe('ARCHIVED');
    });
  });

  describe('remove()', () => {
    it('should delete task', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaService.task.delete.mockResolvedValue({ id: 1 });

      const result = await service.remove(1);
      expect(result.id).toBe(1);
    });

    it('should throw if task not found', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
