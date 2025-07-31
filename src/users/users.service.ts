import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { LoginDto } from 'src/auth/dto/login.dto';
import { ResponseUserDto } from './dto/response-user.dto';

@Injectable()
export class UsersService {

  constructor(private prisma: PrismaService) {}

  toUserResponseDto(user: User): ResponseUserDto {
    const { password, ...rest } = user;
    return rest;
  }

  async create(createUserDto: CreateUserDto): Promise<ResponseUserDto> {  
    try {
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '10');
      const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);
      const user = await this.prisma.user.create({
        data: { ...createUserDto, password: hashedPassword },
      });
      return this.toUserResponseDto(user);
    } catch (error) {
      if (
        error.code === 'P2002' && // Prisma: Unique constraint failed
        error.meta?.target?.includes('username')
      ) {
        throw new ConflictException('Username already exists');
      }

      console.error('Error creating user:', error);
      throw new InternalServerErrorException('Unexpected error');
    }
  }

  findAll() : Promise<ResponseUserDto[]> {
    return this.prisma.user.findMany().then(users => users.map(this.toUserResponseDto));
  }

  async findOne(id: number) : Promise<ResponseUserDto | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if(!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.toUserResponseDto(user);
  }

  findByCredentials(loginDto: LoginDto): Promise<ResponseUserDto | null> {
    return this.prisma.user.findUnique({
      where: { username: loginDto.username },
    }).then(user => {
      if (user && bcrypt.compareSync(loginDto.password, user.password)) {
        return this.toUserResponseDto(user);
      }

      throw new NotFoundException('Invalid credentials');
    });
  }

  update(id: number, updateUserDto: UpdateUserDto) : Promise<Boolean>{
    if (updateUserDto.password) {
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '10');
      const newHashedPassword = bcrypt.hashSync(updateUserDto.password, saltRounds);
      return this.prisma.user.update({
        where: { id },
        data: {...updateUserDto, password: newHashedPassword},
      }).then(() => true).catch(() => false);
    }
    else{
      return this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      }).then(() => true).catch(() => false);
    }
  }

  remove(id: number) : Promise <Boolean> {
    return this.prisma.user.delete({
      where: { id },
    }).then(() => true).catch(() => false);
  }
}
