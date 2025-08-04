import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { OwnerGuard } from 'src/auth/guards/owner.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { ApiBody, ApiOperation } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Create a new user. Only available for admins.' })
  @ApiBody({ type: CreateUserDto })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    console.log("Creating user with data:", createUserDto);
    return this.usersService.create(createUserDto);
  }

  @ApiOperation({ summary: 'Get all users. Only available for admins.' })
  @ApiBody({ type: CreateUserDto })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  findAll() {
    console.log("Fetching all users.");
    return this.usersService.findAll();
  }

  @ApiOperation({ summary: 'Get a user by ID. Only available for the user themselves or admins.' })
  @ApiBody({ type: CreateUserDto })
  @UseGuards(JwtAuthGuard, OwnerGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update a user by ID. Only available for the user themselves or admins.' })
  @ApiBody({ type: UpdateUserDto })
  @UseGuards(JwtAuthGuard, OwnerGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    if (await this.usersService.update(+id, updateUserDto)) {
      return { message: 'User updated successfully' };
    } else {
      return { message: 'User not found' };
    }
  }

  @ApiOperation({ summary: 'Delete a user by ID. Only available for admins.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
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
