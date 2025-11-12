import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@ApiTags('admin')
@Controller('roles')
@UseGuards(JwtAuthGuard, RbacGuard)
@ApiBearerAuth()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @RequirePermissions('users.read')
  @ApiOperation({ summary: 'Get all roles' })
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @RequirePermissions('users.read')
  @ApiOperation({ summary: 'Get role by ID' })
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Post()
  @RequirePermissions('users.write')
  @ApiOperation({ summary: 'Create role' })
  create(@Body() createRoleDto: unknown) {
    return this.rolesService.create(createRoleDto as Parameters<typeof this.rolesService.create>[0]);
  }

  @Patch(':id')
  @RequirePermissions('users.write')
  @ApiOperation({ summary: 'Update role' })
  update(@Param('id') id: string, @Body() updateRoleDto: unknown) {
    return this.rolesService.update(id, updateRoleDto as Parameters<typeof this.rolesService.update>[1]);
  }

  @Delete(':id')
  @RequirePermissions('users.write')
  @ApiOperation({ summary: 'Delete role' })
  remove(@Param('id') id: string) {
    return this.rolesService.delete(id);
  }
}

