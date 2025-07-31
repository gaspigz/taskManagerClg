import { IsString, Length, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { TaskStatus, TaskType } from '@prisma/client';
export class CreateTaskDto {
    @IsString()
    @Length(4, 100)
    title: string;

    @IsString()
    @Length(10, 500)
    description: string;

    @IsNumber()
    @IsOptional()
    ownerId?: number;

    @IsEnum(TaskType)
    type: TaskType;

    @IsEnum(TaskStatus)
    status: TaskStatus;
}
