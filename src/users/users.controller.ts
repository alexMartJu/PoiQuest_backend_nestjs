import { Controller, Get } from '@nestjs/common';
import { UsersService } from './application/services/users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }
}
