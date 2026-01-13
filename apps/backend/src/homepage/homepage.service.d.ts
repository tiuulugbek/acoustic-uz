import { PrismaService } from '../prisma/prisma.service';
export declare class HomepageService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private get client();
    findHearingAids(publicOnly?: boolean): Promise<any>;
    createHearingAid(data: unknown): Promise<any>;
    updateHearingAid(id: string, data: unknown): Promise<any>;
    deleteHearingAid(id: string): Promise<any>;
    findJourney(publicOnly?: boolean): Promise<any>;
    createJourneyStep(data: unknown): Promise<any>;
    updateJourneyStep(id: string, data: unknown): Promise<any>;
    deleteJourneyStep(id: string): Promise<any>;
    findNews(publicOnly?: boolean): Promise<any>;
    createNewsItem(data: unknown): Promise<any>;
    updateNewsItem(id: string, data: unknown): Promise<any>;
    deleteNewsItem(id: string): Promise<any>;
    findServices(publicOnly?: boolean): Promise<any>;
    createService(data: unknown): Promise<any>;
    updateService(id: string, data: unknown): Promise<any>;
    deleteService(id: string): Promise<any>;
}
//# sourceMappingURL=homepage.service.d.ts.map