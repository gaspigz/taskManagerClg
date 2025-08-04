import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
    constructor(private usersService: UsersService, private jwtService: JwtService) {}

    async login(loginDto: LoginDto) {
        const user = await this.usersService.findByCredentials(loginDto);
        if (!user) {
            throw new UnauthorizedException();
        }
        return this.generateToken(user);
    }

    async logout() {
        // Implement logout logic if needed, e.g., invalidate JWT or session
        return { message: 'Logged out successfully' };
    }


    private generateToken(user: any) {
        const payload = { username: user.username, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user: user,
        };
    }


}
