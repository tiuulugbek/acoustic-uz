import { AuditLogService } from './audit-log.service';
export declare class AuditLogController {
    private readonly service;
    constructor(service: AuditLogService);
    findAll(): Promise<{
        id: string;
        action: string;
        createdAt: Date;
        userId: string | null;
        userEmail: string | null;
        entity: string;
        entityId: string;
        changes: import("@prisma/client/runtime/library").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
    }[]>;
}
//# sourceMappingURL=audit-log.controller.d.ts.map