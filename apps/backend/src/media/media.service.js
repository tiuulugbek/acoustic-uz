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
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
let MediaService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var MediaService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            MediaService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        storageService;
        logger = new common_1.Logger(MediaService.name);
        constructor(prisma, storageService) {
            this.prisma = prisma;
            this.storageService = storageService;
        }
        async findAll() {
            return this.prisma.media.findMany({
                orderBy: { createdAt: 'desc' },
            });
        }
        async findOne(id) {
            const media = await this.prisma.media.findUnique({
                where: { id },
            });
            if (!media) {
                throw new common_1.NotFoundException('Media not found');
            }
            return media;
        }
        async create(file, alt_uz, alt_ru, skipWebp) {
            try {
                this.logger.log(`Uploading file: ${file.originalname}, size: ${file.size} bytes, type: ${file.mimetype}`);
                const uploadResult = await this.storageService.upload(file, skipWebp);
                this.logger.log(`File uploaded successfully: ${uploadResult.url}`);
                const media = await this.prisma.media.create({
                    data: {
                        url: uploadResult.url,
                        filename: uploadResult.filename,
                        mimeType: uploadResult.mimeType,
                        size: uploadResult.size,
                        alt_uz,
                        alt_ru,
                    },
                });
                this.logger.log(`Media record created: ${media.id}`);
                return media;
            }
            catch (error) {
                this.logger.error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error.stack : undefined);
                if (error instanceof common_1.NotFoundException || error instanceof common_1.InternalServerErrorException) {
                    throw error;
                }
                throw new common_1.InternalServerErrorException(`Rasm yuklashda xatolik: ${error instanceof Error ? error.message : 'Noma\'lum xatolik'}`);
            }
        }
        async update(id, data) {
            return this.prisma.media.update({
                where: { id },
                data,
            });
        }
        async delete(id) {
            const media = await this.findOne(id);
            await this.storageService.delete(media.url);
            return this.prisma.media.delete({
                where: { id },
            });
        }
    };
    return MediaService = _classThis;
})();
exports.MediaService = MediaService;
//# sourceMappingURL=media.service.js.map