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
exports.DoctorsService = void 0;
const common_1 = require("@nestjs/common");
const shared_1 = require("@acoustic/shared");
let DoctorsService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var DoctorsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            DoctorsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        constructor(prisma) {
            this.prisma = prisma;
        }
        async findAll(publicOnly = false) {
            const where = publicOnly ? { status: 'published' } : {};
            return this.prisma.doctor.findMany({
                where,
                include: { image: true },
                orderBy: { order: 'asc' },
            });
        }
        async findOne(id) {
            const doctor = await this.prisma.doctor.findUnique({
                where: { id },
                include: { image: true },
            });
            if (!doctor) {
                throw new common_1.NotFoundException('Doctor not found');
            }
            return doctor;
        }
        async findBySlug(slug) {
            const doctor = await this.prisma.doctor.findUnique({
                where: { slug, status: 'published' },
                include: { image: true },
            });
            if (!doctor) {
                throw new common_1.NotFoundException('Doctor not found');
            }
            return doctor;
        }
        async create(data) {
            const validated = shared_1.doctorSchema.parse(data);
            return this.prisma.doctor.create({
                data: {
                    ...validated,
                    imageId: validated.imageId ?? undefined,
                },
                include: { image: true },
            });
        }
        async update(id, data) {
            const validated = shared_1.doctorSchema.partial().parse(data);
            const updateData = {
                ...validated,
                ...(validated.imageId !== undefined ? { imageId: validated.imageId } : {}),
            };
            return this.prisma.doctor.update({
                where: { id },
                data: updateData,
                include: { image: true },
            });
        }
        async delete(id) {
            return this.prisma.doctor.delete({
                where: { id },
            });
        }
    };
    return DoctorsService = _classThis;
})();
exports.DoctorsService = DoctorsService;
//# sourceMappingURL=doctors.service.js.map