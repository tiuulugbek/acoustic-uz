"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomepageService = void 0;
const common_1 = require("@nestjs/common");
const shared_1 = require("@acoustic/shared");
let HomepageService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var HomepageService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            HomepageService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        constructor(prisma) {
            this.prisma = prisma;
        }
        get client() {
            return this.prisma;
        }
        async findHearingAids(publicOnly = false) {
            return this.client.homepageHearingAid.findMany({
                where: publicOnly ? { status: 'published' } : {},
                include: { image: true },
                orderBy: [{ order: 'asc' }, { updatedAt: 'desc' }],
            });
        }
        async createHearingAid(data) {
            const validated = shared_1.homepageHearingAidSchema.parse(data);
            return this.client.homepageHearingAid.create({
                data: {
                    ...validated,
                    imageId: validated.imageId ?? undefined,
                },
                include: { image: true },
            });
        }
        async updateHearingAid(id, data) {
            const validated = shared_1.homepageHearingAidSchema.partial().parse(data);
            return this.client.homepageHearingAid.update({
                where: { id },
                data: {
                    ...validated,
                    ...(validated.imageId !== undefined ? { imageId: validated.imageId ?? null } : {}),
                },
                include: { image: true },
            });
        }
        async deleteHearingAid(id) {
            return this.client.homepageHearingAid.delete({ where: { id } });
        }
        async findJourney(publicOnly = false) {
            return this.client.homepageJourneyStep.findMany({
                where: publicOnly ? { status: 'published' } : {},
                orderBy: [{ order: 'asc' }, { updatedAt: 'desc' }],
            });
        }
        async createJourneyStep(data) {
            const validated = shared_1.homepageJourneyStepSchema.parse(data);
            return this.client.homepageJourneyStep.create({ data: validated });
        }
        async updateJourneyStep(id, data) {
            const validated = shared_1.homepageJourneyStepSchema.partial().parse(data);
            return this.client.homepageJourneyStep.update({
                where: { id },
                data: validated,
            });
        }
        async deleteJourneyStep(id) {
            return this.client.homepageJourneyStep.delete({ where: { id } });
        }
        async findNews(publicOnly = false) {
            return this.client.homepageNewsItem.findMany({
                where: publicOnly ? { status: 'published' } : {},
                include: { post: true },
                orderBy: [{ order: 'asc' }, { updatedAt: 'desc' }],
            });
        }
        async createNewsItem(data) {
            const validated = shared_1.homepageNewsItemSchema.parse(data);
            return this.client.homepageNewsItem.create({
                data: {
                    ...validated,
                    postId: validated.postId ?? undefined,
                    slug: validated.slug ?? undefined,
                    publishedAt: validated.publishedAt ?? undefined,
                },
                include: { post: true },
            });
        }
        async updateNewsItem(id, data) {
            const validated = shared_1.homepageNewsItemSchema.partial().parse(data);
            return this.client.homepageNewsItem.update({
                where: { id },
                data: {
                    ...validated,
                    ...(validated.postId !== undefined ? { postId: validated.postId ?? null } : {}),
                    ...(validated.slug !== undefined ? { slug: validated.slug ?? null } : {}),
                    ...(validated.publishedAt !== undefined
                        ? { publishedAt: validated.publishedAt ?? null }
                        : {}),
                },
                include: { post: true },
            });
        }
        async deleteNewsItem(id) {
            return this.client.homepageNewsItem.delete({ where: { id } });
        }
        async findServices(publicOnly = false) {
            return this.client.homepageService.findMany({
                where: publicOnly ? { status: 'published' } : {},
                include: { image: true },
                orderBy: [{ order: 'asc' }, { updatedAt: 'desc' }],
            });
        }
        async createService(data) {
            const validated = shared_1.homepageServiceSchema.parse(data);
            return this.client.homepageService.create({
                data: {
                    ...validated,
                    imageId: validated.imageId ?? undefined,
                },
                include: { image: true },
            });
        }
        async updateService(id, data) {
            const validated = shared_1.homepageServiceSchema.partial().parse(data);
            return this.client.homepageService.update({
                where: { id },
                data: {
                    ...validated,
                    ...(validated.imageId !== undefined ? { imageId: validated.imageId ?? null } : {}),
                },
                include: { image: true },
            });
        }
        async deleteService(id) {
            return this.client.homepageService.delete({ where: { id } });
        }
    };
    return HomepageService = _classThis;
})();
exports.HomepageService = HomepageService;
//# sourceMappingURL=homepage.service.js.map