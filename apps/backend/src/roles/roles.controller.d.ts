import { RolesService } from './roles.service';
export declare class RolesController {
    private readonly rolesService;
    constructor(rolesService: RolesService);
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
    create(createRoleDto: unknown): Promise<{
        name: string;
        id: string;
        permissions: string[];
    }>;
    update(id: string, updateRoleDto: unknown): Promise<{
        name: string;
        id: string;
        permissions: string[];
    }>;
    remove(id: string): Promise<{
        name: string;
        id: string;
        permissions: string[];
    }>;
}
//# sourceMappingURL=roles.controller.d.ts.map