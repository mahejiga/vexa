import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { DocumentosService } from './documentos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Documentos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documentos')
export class DocumentosController {
  constructor(private documentosService: DocumentosService) {}

  @Get('operacion/:operacionId')
  findByOperacion(@Param('operacionId') operacionId: string) {
    return this.documentosService.findByOperacion(operacionId);
  }

  @Post()
  create(@Body() body: any) {
    return this.documentosService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.documentosService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.documentosService.remove(id);
  }
}
