import { Controller, Get, Post, Body, Query, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { TaskOwnerGuard } from 'src/auth/guards/task-owner.guard';
import { ApiBody, ApiOperation, ApiQuery } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}


  @ApiOperation({ summary: 'Create a new task' })
  @ApiBody({ type: CreateTaskDto })
  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    return this.tasksService.create(createTaskDto, req.user);
  }

  @ApiOperation({ summary: 'Get all tasks with optional filters' })
  @ApiQuery({ name: 'title', required: false })
  @ApiQuery({ name: 'type', required: false, enum: ['URGENT', 'MEDIUM', 'LOW'] })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['createdAt', 'updatedAt', 'title'], example: 'createdAt' })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'], example: 'desc' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @Get()
  findAll(@Request() req, @Query() query: any) {
    console.log("Fetching all tasks for user:", req.user);

    return this.tasksService.findAll(req.user, query);
  }

  @ApiOperation({ summary: 'Get a task by ID' })
  @UseGuards(TaskOwnerGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update a task by ID' })
  @ApiBody({ type: UpdateTaskDto })
  @UseGuards(TaskOwnerGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(+id, updateTaskDto);
  }

  @ApiOperation({ summary: 'Archive a task by ID' })
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/archive')
  archive(@Param('id') id: string) {
    return this.tasksService.archive(+id);
  }

  @ApiOperation({ summary: 'Get tasks from a specific user' })
  @ApiQuery({ name: 'userId', required: true, type: Number })
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('user/:userId')
  getTasksFromUser(@Param('userId') userId: string) {
    return this.tasksService.getTasksFromUser(+userId);
  }

  @ApiOperation({ summary: 'Remove a task by ID' })

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(+id);
  }
}
