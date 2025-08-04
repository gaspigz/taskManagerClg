import { IsString, Length, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus, TaskType } from '@prisma/client';
export class CreateTaskDto {
    @IsString()
    @Length(4, 100)
    @ApiProperty()
    title: string;

    @IsString()
    @Length(10, 500)
    @ApiProperty()
    description: string;

    @IsNumber()
    @IsOptional()
    @ApiProperty({ required: false })
    ownerId?: number;

    @IsEnum(TaskType)
    @ApiProperty({ enum: TaskType })
    type: TaskType;

    @IsEnum(TaskStatus)
    @ApiProperty({ enum: TaskStatus })
    status: TaskStatus;
}
