import { Role } from '@prisma/client';

export class ResponseUserDto {
  id: number;
  username: string;
  name: string;
  role: Role;
  createdAt: Date;
}
