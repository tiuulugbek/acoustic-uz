import { PrismaService } from '../prisma/prisma.service';
export declare class RolesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        name: string;
        id: string;
        permissions: string[];
    }[]>;
    findOne(id: string): Promise<{
        name: string;
        id: string;
        permissions: string[];
    }>;
    create(data: {
        name: string;
        permissions: string[];
    }): Promise<{
        name: string;
        id: string;
        permissions: string[];
    }>;
    update(id: string, data: {
        name?: string;
        permissions?: string[];
    }): Promise<{
        name: string;
        id: string;
        permissions: string[];
    }>;
    delete(id: string): Promise<{
        name: string;
        id: string;
        permissions: string[];
    }>;
}
//# sourceMappingURL=roles.service.d.ts.map