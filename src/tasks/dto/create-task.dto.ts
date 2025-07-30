import { IsString, Length, IsNumber } from 'class-validator';
export class CreateTaskDto {
    @IsString()
    @Length(4, 100)
    title: string;

    @IsString()
    @Length(10, 500)
    description: string;

    @IsNumber()
    ownerId?: number;

    type: 'URGENT' | 'MEDIUM' | 'LOW';
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
}
