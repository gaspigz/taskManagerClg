import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma.service';
import { ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { LoginDto } from '../auth/dto/login.dto';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Setup bcrypt mocks
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
    (bcrypt.hashSync as jest.Mock).mockReturnValue('hashedPassword');
    (bcrypt.compareSync as jest.Mock).mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      username: 'testuser',
      password: 'password123',
      role: 'USER',
      name: 'Test User',
    };

    const mockCreatedUser = {
      id: 1,
      username: 'testuser',
      password: 'hashedPassword',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
      name: 'Test User',
    };

    it('should create a user successfully', async () => {
      process.env.BCRYPT_SALT_ROUNDS = '10';
      mockPrismaService.user.create.mockResolvedValue(mockCreatedUser);

      const result = await service.create(createUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: { ...createUserDto, password: 'hashedPassword' },
      });
      expect(result).toEqual({
        id: 1,
        username: 'testuser',
        name: 'Test User',
        role: 'USER',
        createdAt: mockCreatedUser.createdAt,
        updatedAt: mockCreatedUser.updatedAt,
      });
    });

    it('should throw ConflictException when username already exists', async () => {
      const prismaError = {
        code: 'P2002',
        meta: { target: ['username'] },
      };
      mockPrismaService.user.create.mockRejectedValue(prismaError);

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
    });

    it('should throw InternalServerErrorException for unexpected errors', async () => {
      mockPrismaService.user.create.mockRejectedValue(new Error('Unexpected error'));

      await expect(service.create(createUserDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findAll', () => {
    it('should return all users without passwords', async () => {
      const mockUsers = [
        {
          id: 1,
          username: 'user1',
          password: 'hashedPassword1',
          role: 'USER',
          name: 'User One',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          username: 'user2',
          password: 'hashedPassword2',
          role: 'ADMIN',
          name: 'User Two',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(mockPrismaService.user.findMany).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('password');
      expect(result[1]).not.toHaveProperty('password');
    });
  });

  describe('findOne', () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      password: 'hashedPassword',
      name: 'Test User',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return user without password when found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).not.toHaveProperty('password');
      expect(result?.id).toBe(1);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByCredentials', () => {
    const loginDto: LoginDto = {
      username: 'testuser',
      password: 'password123',
    };

    const mockUser = {
      id: 1,
      username: 'testuser',
      password: 'hashedPassword',
      name: 'Test User',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return user without password when credentials are valid', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compareSync as jest.Mock).mockReturnValue(true);

      const result = await service.findByCredentials(loginDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { username: loginDto.username },
      });
      expect(bcrypt.compareSync).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(result).not.toHaveProperty('password');
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findByCredentials(loginDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when password is invalid', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compareSync as jest.Mock).mockReturnValue(false);

      await expect(service.findByCredentials(loginDto)).rejects.toThrow(NotFoundException);
    });
  });
});