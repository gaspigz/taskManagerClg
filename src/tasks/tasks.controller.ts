import { Controller, Get, Post, Body, Query, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { TaskOwnerGuard } from 'src/auth/guards/task-owner.guard';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    return this.tasksService.create(createTaskDto, req.user);
  }

  @Get()
  findAll(@Request() req, @Query() query: any) {
    console.log("Fetching all tasks for user:", req.user);

    return this.tasksService.findAll(req.user, query);
  }

  @UseGuards(TaskOwnerGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(+id);
  }

  @UseGuards(TaskOwnerGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(+id, updateTaskDto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/archive')
  archive(@Param('id') id: string) {
    return this.tasksService.archive(+id);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('user/:userId')
  getTasksFromUser(@Param('userId') userId: string) {
    return this.tasksService.getTasksFromUser(+userId);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(+id);
  }
}
