import { MenusService } from './menus.service';
export declare class MenusController {
    private readonly service;
    constructor(service: MenusService);
    findOne(name: string): Promise<{
        name: string;
        id: string;
        updatedAt: Date;
        items: import("@prisma/client/runtime/library").JsonValue;
    }>;
    update(name: string, dto: {
        items: unknown;
    }): Promise<{
        name: string;
        id: string;
        updatedAt: Date;
        items: import("@prisma/client/runtime/library").JsonValue;
    }>;
}
//# sourceMappingURL=menus.controller.d.ts.map