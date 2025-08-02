import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserViewModel } from '../users/models/user-view.model';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterUserDto })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: UserViewModel,
  })
  async register(@Body() dto: RegisterUserDto): Promise<UserViewModel> {
    const user = await this.authService.register(dto);
    const { password, ...rest } = user;
    return rest;
  }
}
