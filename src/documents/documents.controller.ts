import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';

@Controller('documents')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('dev', 'admin')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  findAll() {
    return this.documentsService.findAll();
  }

  @Post()
  create(@Body() body: Partial<any>) {
    return this.documentsService.create(body);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.documentsService.remove(id);
  }
}