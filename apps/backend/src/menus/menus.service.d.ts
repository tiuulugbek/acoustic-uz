import { PrismaService } from '../prisma/prisma.service';
export declare class MenusService {
    private prisma;
    constructor(prisma: PrismaService);
    findOne(name: string): Promise<{
        name: string;
        id: string;
        updatedAt: Date;
        items: import("@prisma/client/runtime/library").JsonValue;
    }>;
    update(name: string, items: unknown): Promise<{
        name: string;
        id: string;
        updatedAt: Date;
        items: import("@prisma/client/runtime/library").JsonValue;
    }>;
}
//# sourceMappingURL=menus.service.d.ts.map