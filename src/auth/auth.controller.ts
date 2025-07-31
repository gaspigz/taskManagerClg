import { Controller, Post, Request, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto'; 

@Controller('')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
  
  /*@Post('logout')
  async logout(@Request() req) {
    return this.authService.logout(req);
  }*/
}
