import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    console.log("Creating user with data:", createUserDto);
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    console.log("Fetching all users.");
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    if (await this.usersService.update(+id, updateUserDto)) {
      return { message: 'User updated successfully' };
    } else {
      return { message: 'User not found' };
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    console.log(`Removing user with ID: ${id}`);
    if (isNaN(+id)) {
      throw new HttpException('Invalid ID format', 400);
    }
    console.log(`Calling service to remove user with ID: ${id}`);
    if (+id <= 0) {
      throw new HttpException('ID must be a positive integer', 400);
    }

    if (await this.usersService.remove(+id)) {
      return { message: 'User removed successfully' };
    } else {
      return { message: 'User not found' };
    }
  }
}
