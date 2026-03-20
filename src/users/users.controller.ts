import { Controller, Get, Post, Delete, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRole } from './entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('dev', 'admin')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  create(@Body() body: { username: string; password: string; fullname: string; role: UserRole }) {
    return this.usersService.create(body);
  }

  @Patch(':id/role')
  updateRole(@Param('id') id: number, @Body() body: { role: UserRole }) {
    return this.usersService.updateRole(id, body.role);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.usersService.remove(id);
  }
}