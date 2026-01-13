import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private prisma;
    constructor(configService: ConfigService, prisma: PrismaService);
    validate(payload: {
        sub: string;
        email: string;
        role: string;
    }): Promise<{
        id: string;
        email: string;
        fullName: string | null;
        roleId: string;
        role: {
            name: string;
            id: string;
            permissions: string[];
        };
        mustChangePassword: boolean;
    }>;
}
export {};
//# sourceMappingURL=jwt.strategy.d.ts.map