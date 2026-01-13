import { DoctorsService } from './doctors.service';
export declare class DoctorsController {
    private readonly doctorsService;
    constructor(doctorsService: DoctorsService);
    findAll(publicOnly?: string): Promise<({
        image: {
            id: string;
            size: number | null;
            createdAt: Date;
            updatedAt: Date;
            alt_uz: string | null;
            alt_ru: string | null;
            url: string;
            filename: string | null;
            mimeType: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        status: string;
        name_uz: string;
        name_ru: string;
        description_uz: string | null;
        description_ru: string | null;
        imageId: string | null;
        order: number;
        position_uz: string | null;
        position_ru: string | null;
        experience_uz: string | null;
        experience_ru: string | null;
        branchIds: string[];
        patientTypes: string[];
    })[]>;
    findBySlug(slug: string): Promise<{
        image: {
            id: string;
            size: number | null;
            createdAt: Date;
            updatedAt: Date;
            alt_uz: string | null;
            alt_ru: string | null;
            url: string;
            filename: string | null;
            mimeType: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        status: string;
        name_uz: string;
        name_ru: string;
        description_uz: string | null;
        description_ru: string | null;
        imageId: string | null;
        order: number;
        position_uz: string | null;
        position_ru: string | null;
        experience_uz: string | null;
        experience_ru: string | null;
        branchIds: string[];
        patientTypes: string[];
    }>;
    findAllAdmin(): Promise<({
        image: {
            id: string;
            size: number | null;
            createdAt: Date;
            updatedAt: Date;
            alt_uz: string | null;
            alt_ru: string | null;
            url: string;
            filename: string | null;
            mimeType: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        status: string;
        name_uz: string;
        name_ru: string;
        description_uz: string | null;
        description_ru: string | null;
        imageId: string | null;
        order: number;
        position_uz: string | null;
        position_ru: string | null;
        experience_uz: string | null;
        experience_ru: string | null;
        branchIds: string[];
        patientTypes: string[];
    })[]>;
    findOne(id: string): Promise<{
        image: {
            id: string;
            size: number | null;
            createdAt: Date;
            updatedAt: Date;
            alt_uz: string | null;
            alt_ru: string | null;
            url: string;
            filename: string | null;
            mimeType: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        status: string;
        name_uz: string;
        name_ru: string;
        description_uz: string | null;
        description_ru: string | null;
        imageId: string | null;
        order: number;
        position_uz: string | null;
        position_ru: string | null;
        experience_uz: string | null;
        experience_ru: string | null;
        branchIds: string[];
        patientTypes: string[];
    }>;
    create(createDto: unknown): Promise<{
        image: {
            id: string;
            size: number | null;
            createdAt: Date;
            updatedAt: Date;
            alt_uz: string | null;
            alt_ru: string | null;
            url: string;
            filename: string | null;
            mimeType: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        status: string;
        name_uz: string;
        name_ru: string;
        description_uz: string | null;
        description_ru: string | null;
        imageId: string | null;
        order: number;
        position_uz: string | null;
        position_ru: string | null;
        experience_uz: string | null;
        experience_ru: string | null;
        branchIds: string[];
        patientTypes: string[];
    }>;
    update(id: string, updateDto: unknown): Promise<{
        image: {
            id: string;
            size: number | null;
            createdAt: Date;
            updatedAt: Date;
            alt_uz: string | null;
            alt_ru: string | null;
            url: string;
            filename: string | null;
            mimeType: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        status: string;
        name_uz: string;
        name_ru: string;
        description_uz: string | null;
        description_ru: string | null;
        imageId: string | null;
        order: number;
        position_uz: string | null;
        position_ru: string | null;
        experience_uz: string | null;
        experience_ru: string | null;
        branchIds: string[];
        patientTypes: string[];
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        status: string;
        name_uz: string;
        name_ru: string;
        description_uz: string | null;
        description_ru: string | null;
        imageId: string | null;
        order: number;
        position_uz: string | null;
        position_ru: string | null;
        experience_uz: string | null;
        experience_ru: string | null;
        branchIds: string[];
        patientTypes: string[];
    }>;
}
//# sourceMappingURL=doctors.controller.d.ts.map