// src/auth/guards/owner.guard.ts
import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import { JwtUserInterface } from '../interfaces/jwt-user.interface';

@Injectable()
export class OwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    const user = request.user as JwtUserInterface; // inyectado por JwtStrategy
    const paramId = parseInt(request.params.id, 10);
    
    if (!user || isNaN(paramId)) {
        throw new ForbiddenException('Access denied');
    }

    console.log(`User ID from token: ${JSON.stringify(user)}, Param ID: ${paramId}`);

    if (user.userId !== paramId && user.role !== 'ADMIN') {
      throw new ForbiddenException('You can only access your own user data');
    }

    return true;
  }
}
