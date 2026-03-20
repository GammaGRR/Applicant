import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/auth/guards/roles.decorator';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AdminController {

  @Get()
  @Roles('dev', 'admin')
  getAdminPage() {
    return { message: 'Добро пожаловать в админ панель' };
  }
}