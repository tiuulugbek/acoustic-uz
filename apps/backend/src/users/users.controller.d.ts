import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
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
    create(createUserDto: unknown): Promise<{
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
    update(id: string, updateUserDto: unknown): Promise<{
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
    remove(id: string): Promise<{
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
//# sourceMappingURL=users.controller.d.ts.map