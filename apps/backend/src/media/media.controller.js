"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const rbac_guard_1 = require("../common/guards/rbac.guard");
const permissions_decorator_1 = require("../common/decorators/permissions.decorator");
let MediaController = (() => {
    let _classDecorators = [(0, swagger_1.ApiTags)('admin'), (0, common_1.Controller)('media'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard), (0, swagger_1.ApiBearerAuth)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _findAll_decorators;
    let _findOne_decorators;
    let _upload_decorators;
    let _update_decorators;
    let _remove_decorators;
    var MediaController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _findAll_decorators = [(0, common_1.Get)(), (0, permissions_decorator_1.RequirePermissions)('media.read'), (0, swagger_1.ApiOperation)({ summary: 'Get all media' })];
            _findOne_decorators = [(0, common_1.Get)(':id'), (0, permissions_decorator_1.RequirePermissions)('media.read'), (0, swagger_1.ApiOperation)({ summary: 'Get media by ID' })];
            _upload_decorators = [(0, common_1.Post)(), (0, permissions_decorator_1.RequirePermissions)('media.write'), (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
                    limits: {
                        fileSize: 10 * 1024 * 1024, // 10MB
                    },
                    fileFilter: (req, file, cb) => {
                        // Faqat rasm fayllarini qabul qilish
                        if (!file.mimetype.startsWith('image/')) {
                            return cb(new common_1.BadRequestException('Faqat rasm fayllari qabul qilinadi'), false);
                        }
                        cb(null, true);
                    },
                })), (0, swagger_1.ApiConsumes)('multipart/form-data'), (0, swagger_1.ApiBody)({
                    schema: {
                        type: 'object',
                        properties: {
                            file: {
                                type: 'string',
                                format: 'binary',
                            },
                            alt_uz: { type: 'string' },
                            alt_ru: { type: 'string' },
                            skipWebp: { type: 'boolean', description: 'Skip WebP conversion (useful for panorama images)' },
                        },
                    },
                }), (0, swagger_1.ApiOperation)({ summary: 'Upload media' })];
            _update_decorators = [(0, common_1.Patch)(':id'), (0, permissions_decorator_1.RequirePermissions)('media.write'), (0, swagger_1.ApiOperation)({ summary: 'Update media' })];
            _remove_decorators = [(0, common_1.Delete)(':id'), (0, permissions_decorator_1.RequirePermissions)('media.write'), (0, swagger_1.ApiOperation)({ summary: 'Delete media' })];
            __esDecorate(this, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findOne_decorators, { kind: "method", name: "findOne", static: false, private: false, access: { has: obj => "findOne" in obj, get: obj => obj.findOne }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _upload_decorators, { kind: "method", name: "upload", static: false, private: false, access: { has: obj => "upload" in obj, get: obj => obj.upload }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _remove_decorators, { kind: "method", name: "remove", static: false, private: false, access: { has: obj => "remove" in obj, get: obj => obj.remove }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            MediaController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        mediaService = __runInitializers(this, _instanceExtraInitializers);
        logger = new common_1.Logger(MediaController.name);
        constructor(mediaService) {
            this.mediaService = mediaService;
        }
        findAll() {
            return this.mediaService.findAll();
        }
        findOne(id) {
            return this.mediaService.findOne(id);
        }
        async upload(file, alt_uz, alt_ru, skipWebp) {
            try {
                this.logger.log(`Upload request received. File: ${file?.originalname || 'none'}, Size: ${file?.size || 0} bytes`);
                if (!file) {
                    this.logger.warn('Upload request without file');
                    throw new common_1.BadRequestException('Rasm fayli yuborilmadi');
                }
                // File size validation
                const maxSize = 10 * 1024 * 1024; // 10MB
                if (file.size > maxSize) {
                    this.logger.warn(`File too large: ${file.size} bytes (max: ${maxSize})`);
                    throw new common_1.BadRequestException(`Rasm hajmi juda katta. Maksimal hajm: 10MB`);
                }
                // File type validation
                if (!file.mimetype || !file.mimetype.startsWith('image/')) {
                    this.logger.warn(`Invalid file type: ${file.mimetype}`);
                    throw new common_1.BadRequestException('Faqat rasm fayllari qabul qilinadi');
                }
                const shouldSkipWebp = skipWebp === 'true';
                const result = await this.mediaService.create(file, alt_uz, alt_ru, shouldSkipWebp);
                this.logger.log(`Upload successful: ${result.id}`);
                return result;
            }
            catch (error) {
                this.logger.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error.stack : undefined);
                if (error instanceof common_1.HttpException) {
                    throw error;
                }
                throw new common_1.BadRequestException(`Rasm yuklashda xatolik: ${error instanceof Error ? error.message : 'Noma\'lum xatolik'}`);
            }
        }
        update(id, updateDto) {
            return this.mediaService.update(id, updateDto);
        }
        remove(id) {
            return this.mediaService.delete(id);
        }
    };
    return MediaController = _classThis;
})();
exports.MediaController = MediaController;
//# sourceMappingURL=media.controller.js.map