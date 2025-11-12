import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@ApiTags('admin')
@Controller('audit-log')
@UseGuards(JwtAuthGuard, RbacGuard)
export class AuditLogController {
  constructor(private readonly service: AuditLogService) {}

  @Get()
  @RequirePermissions('audit.read')
  findAll() {
    return this.service.findAll();
  }
}

