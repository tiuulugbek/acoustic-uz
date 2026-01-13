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
exports.ServicesService = void 0;
const common_1 = require("@nestjs/common");
const shared_1 = require("@acoustic/shared");
let ServicesService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ServicesService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ServicesService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        constructor(prisma) {
            this.prisma = prisma;
        }
        async findAll(publicOnly = false, categoryId) {
            const where = publicOnly ? { status: 'published' } : {};
            if (categoryId) {
                where.categoryId = categoryId;
            }
            return this.prisma.service.findMany({
                where,
                include: { cover: true, category: true },
                orderBy: { order: 'asc' },
            });
        }
        async findOne(id) {
            const service = await this.prisma.service.findUnique({
                where: { id },
                include: { cover: true, category: true },
            });
            if (!service) {
                throw new common_1.NotFoundException('Service not found');
            }
            return service;
        }
        async findBySlug(slug) {
            const service = await this.prisma.service.findUnique({
                where: { slug, status: 'published' },
                include: { cover: true, category: true },
            });
            if (!service) {
                throw new common_1.NotFoundException('Service not found');
            }
            return service;
        }
        async create(data) {
            const validated = shared_1.serviceSchema.parse(data);
            return this.prisma.service.create({
                data: {
                    ...validated,
                    coverId: validated.coverId ?? undefined,
                    categoryId: validated.categoryId ?? undefined,
                },
                include: { cover: true, category: true },
            });
        }
        async update(id, data) {
            const validated = shared_1.serviceSchema.partial().parse(data);
            const updateData = {
                ...validated,
                ...(validated.coverId !== undefined ? { coverId: validated.coverId } : {}),
                ...(validated.categoryId !== undefined ? { categoryId: validated.categoryId } : {}),
            };
            return this.prisma.service.update({
                where: { id },
                data: updateData,
                include: { cover: true, category: true },
            });
        }
        async delete(id) {
            return this.prisma.service.delete({
                where: { id },
            });
        }
    };
    return ServicesService = _classThis;
})();
exports.ServicesService = ServicesService;
//# sourceMappingURL=services.service.js.map