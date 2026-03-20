import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { SpecialitiesService } from './specialty.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';

@Controller('specialities')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('dev', 'admin')
export class SpecialitiesController {
  constructor(private readonly specialitiesService: SpecialitiesService) {}

  @Get()
  findAll() {
    return this.specialitiesService.findAll();
  }

  @Post()
  create(@Body() body: Partial<any>) {
    return this.specialitiesService.create(body);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.specialitiesService.remove(id);
  }
}