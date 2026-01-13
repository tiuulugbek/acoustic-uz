import { HomepageService } from './homepage.service';
export declare class HomepageController {
    private readonly homepage;
    constructor(homepage: HomepageService);
    findPublicHearingAids(): Promise<any>;
    findAllHearingAids(): Promise<any>;
    createHearingAid(dto: unknown): Promise<any>;
    updateHearingAid(id: string, dto: unknown): Promise<any>;
    deleteHearingAid(id: string): Promise<any>;
    findPublicJourney(): Promise<any>;
    findAllJourney(): Promise<any>;
    createJourney(dto: unknown): Promise<any>;
    updateJourney(id: string, dto: unknown): Promise<any>;
    deleteJourney(id: string): Promise<any>;
    findPublicNews(): Promise<any>;
    findAllNews(): Promise<any>;
    createNews(dto: unknown): Promise<any>;
    updateNews(id: string, dto: unknown): Promise<any>;
    deleteNews(id: string): Promise<any>;
    findPublicServices(): Promise<any>;
    findAllServices(): Promise<any>;
    createService(dto: unknown): Promise<any>;
    updateService(id: string, dto: unknown): Promise<any>;
    deleteService(id: string): Promise<any>;
}
//# sourceMappingURL=homepage.controller.d.ts.map