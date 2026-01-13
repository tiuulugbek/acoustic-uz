import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        role: {
            name: string;
            id: string;
            permissions: string[];
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        password: string;
        fullName: string | null;
        isActive: boolean;
        mustChangePassword: boolean;
        roleId: string;
    })[]>;
    findOne(id: string): Promise<{
        role: {
            name: string;
            id: string;
            permissions: string[];
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        password: string;
        fullName: string | null;
        isActive: boolean;
        mustChangePassword: boolean;
        roleId: string;
    }>;
    create(data: {
        email: string;
        password: string;
        fullName?: string;
        roleId: string;
    }): Promise<{
        role: {
            name: string;
            id: string;
            permissions: string[];
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        password: string;
        fullName: string | null;
        isActive: boolean;
        mustChangePassword: boolean;
        roleId: string;
    }>;
    update(id: string, data: {
        email?: string;
        fullName?: string;
        roleId?: string;
        isActive?: boolean;
    }): Promise<{
        role: {
            name: string;
            id: string;
            permissions: string[];
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        password: string;
        fullName: string | null;
        isActive: boolean;
        mustChangePassword: boolean;
        roleId: string;
    }>;
    delete(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        password: string;
        fullName: string | null;
        isActive: boolean;
        mustChangePassword: boolean;
        roleId: string;
    }>;
}
//# sourceMappingURL=users.service.d.ts.map