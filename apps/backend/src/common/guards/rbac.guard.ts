import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>('permissions', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Get user role with permissions
    const role = await this.prisma.role.findUnique({
      where: { id: user.roleId },
    });

    if (!role) {
      return false;
    }

    // Superadmin has all permissions
    if (role.permissions.includes('*')) {
      return true;
    }

    // Check if user has all required permissions
    return requiredPermissions.every((permission) => {
      // Support wildcard matching (e.g., 'content.*' matches 'content.read')
      return role.permissions.some((userPermission) => {
        if (userPermission === '*') return true;
        if (userPermission === permission) return true;
        if (userPermission.endsWith('.*')) {
          const prefix = userPermission.slice(0, -2);
          return permission.startsWith(prefix + '.');
        }
        return false;
      });
    });
  }
}

