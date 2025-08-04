import { Controller, Get, Post, Body, Query, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nueva tarea (User o Admin)' })
  @ApiBody({ type: CreateTaskDto })
  create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    return this.tasksService.create(createTaskDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Listar tareas del usuario autenticado' })
  @ApiQuery({ name: 'title', required: false })
  @ApiQuery({ name: 'type', required: false, enum: ['URGENT', 'MEDIUM', 'LOW'] })
  findAll(@Request() req, @Query() query: any) {
    return this.tasksService.findAll(req.user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una tarea por ID (Propietario o admin)' })
  @ApiParam({ name: 'id', type: 'string' })
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar tarea (Propietario o admin)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: UpdateTaskDto })
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(+id, updateTaskDto);
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archivar tarea (ADMIN)' })
  @ApiParam({ name: 'id', type: 'string' })
  archive(@Param('id') id: string) {
    return this.tasksService.archive(+id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Listar tareas de un usuario específico (solo ADMIN)' })
  @ApiParam({ name: 'userId', type: 'string' })
  getTasksFromUser(@Param('userId') userId: string) {
    return this.tasksService.getTasksFromUser(+userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar tarea por ID (solo ADMIN)' })
  @ApiParam({ name: 'id', type: 'string' })
  remove(@Param('id') id: string) {
    return this.tasksService.remove(+id);
  }
}
