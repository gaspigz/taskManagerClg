import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UsersService {

  constructor(private prisma: PrismaService) {}

  create(createUserDto: CreateUserDto) : Promise<User> {
    console.log("Creating user with data:", createUserDto);
    
    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  findAll() : Promise<User[]> {
    return this.prisma.user.findMany();
  }

  findOne(id: number) : Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  update(id: number, updateUserDto: UpdateUserDto) : Promise<Boolean>{
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    }).then(() => true).catch(() => false);
  }

  remove(id: number) : Promise <Boolean> {
    return this.prisma.user.delete({
      where: { id },
    }).then(() => true).catch(() => false);
  }
}
