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
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const rbac_guard_1 = require("../common/guards/rbac.guard");
const permissions_decorator_1 = require("../common/decorators/permissions.decorator");
const public_decorator_1 = require("../common/decorators/public.decorator");
const multer_1 = require("multer");
const path_1 = require("path");
let ProductsController = (() => {
    let _classDecorators = [(0, swagger_1.ApiTags)('public', 'admin'), (0, common_1.Controller)('products')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _findAll_decorators;
    let _findBySlug_decorators;
    let _findAllAdmin_decorators;
    let _findOne_decorators;
    let _create_decorators;
    let _update_decorators;
    let _remove_decorators;
    let _importExcel_decorators;
    let _downloadExcelTemplate_decorators;
    var ProductsController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _findAll_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Get)(), (0, swagger_1.ApiOperation)({ summary: 'Get all products (public)' })];
            _findBySlug_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Get)('slug/:slug'), (0, swagger_1.ApiOperation)({ summary: 'Get product by slug (public)' })];
            _findAllAdmin_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard), (0, common_1.Get)('admin'), (0, permissions_decorator_1.RequirePermissions)('content.read'), (0, swagger_1.ApiBearerAuth)()];
            _findOne_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard), (0, common_1.Get)('admin/:id'), (0, permissions_decorator_1.RequirePermissions)('content.read'), (0, swagger_1.ApiBearerAuth)()];
            _create_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard), (0, common_1.Post)(), (0, permissions_decorator_1.RequirePermissions)('content.write'), (0, swagger_1.ApiBearerAuth)()];
            _update_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard), (0, common_1.Patch)(':id'), (0, permissions_decorator_1.RequirePermissions)('content.write'), (0, swagger_1.ApiBearerAuth)()];
            _remove_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard), (0, common_1.Delete)(':id'), (0, permissions_decorator_1.RequirePermissions)('content.write'), (0, swagger_1.ApiBearerAuth)()];
            _importExcel_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard), (0, common_1.Post)('import/excel'), (0, permissions_decorator_1.RequirePermissions)('content.write'), (0, swagger_1.ApiBearerAuth)(), (0, swagger_1.ApiOperation)({ summary: 'Import products from Excel file' }), (0, swagger_1.ApiConsumes)('multipart/form-data'), (0, swagger_1.ApiBody)({
                    schema: {
                        type: 'object',
                        properties: {
                            file: {
                                type: 'string',
                                format: 'binary',
                            },
                        },
                    },
                }), (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
                    storage: (0, multer_1.diskStorage)({
                        destination: './uploads/temp',
                        filename: (req, file, cb) => {
                            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                            cb(null, `excel-${uniqueSuffix}${(0, path_1.extname)(file.originalname)}`);
                        },
                    }),
                    fileFilter: (req, file, cb) => {
                        const allowedExtensions = ['.xlsx', '.xls'];
                        const ext = (0, path_1.extname)(file.originalname).toLowerCase();
                        if (allowedExtensions.includes(ext)) {
                            cb(null, true);
                        }
                        else {
                            cb(new Error('Faqat Excel fayllari (.xlsx, .xls) qabul qilinadi'), false);
                        }
                    },
                    limits: {
                        fileSize: 10 * 1024 * 1024, // 10MB
                    },
                }))];
            _downloadExcelTemplate_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard), (0, common_1.Get)('import/excel-template'), (0, permissions_decorator_1.RequirePermissions)('content.read'), (0, swagger_1.ApiBearerAuth)(), (0, swagger_1.ApiOperation)({ summary: 'Download Excel template for product import' })];
            __esDecorate(this, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findBySlug_decorators, { kind: "method", name: "findBySlug", static: false, private: false, access: { has: obj => "findBySlug" in obj, get: obj => obj.findBySlug }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findAllAdmin_decorators, { kind: "method", name: "findAllAdmin", static: false, private: false, access: { has: obj => "findAllAdmin" in obj, get: obj => obj.findAllAdmin }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findOne_decorators, { kind: "method", name: "findOne", static: false, private: false, access: { has: obj => "findOne" in obj, get: obj => obj.findOne }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _remove_decorators, { kind: "method", name: "remove", static: false, private: false, access: { has: obj => "remove" in obj, get: obj => obj.remove }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _importExcel_decorators, { kind: "method", name: "importExcel", static: false, private: false, access: { has: obj => "importExcel" in obj, get: obj => obj.importExcel }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _downloadExcelTemplate_decorators, { kind: "method", name: "downloadExcelTemplate", static: false, private: false, access: { has: obj => "downloadExcelTemplate" in obj, get: obj => obj.downloadExcelTemplate }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ProductsController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        productsService = __runInitializers(this, _instanceExtraInitializers);
        constructor(productsService) {
            this.productsService = productsService;
        }
        findAll(filters) {
            const limit = filters.limit ? parseInt(filters.limit, 10) : undefined;
            const offset = filters.offset ? parseInt(filters.offset, 10) : undefined;
            return this.productsService.findAll({
                ...filters,
                status: 'published',
                limit,
                offset,
                sort: filters.sort,
            });
        }
        findBySlug(slug) {
            return this.productsService.findBySlug(slug);
        }
        findAllAdmin(filters) {
            return this.productsService.findAll(filters);
        }
        findOne(id) {
            return this.productsService.findOne(id);
        }
        create(createDto) {
            return this.productsService.create(createDto);
        }
        update(id, updateDto) {
            return this.productsService.update(id, updateDto);
        }
        remove(id) {
            return this.productsService.delete(id);
        }
        async importExcel(file) {
            if (!file) {
                throw new Error('Fayl yuklanmadi');
            }
            const fs = require('fs').promises;
            const path = require('path');
            const uploadsDir = path.join(process.cwd(), 'uploads', 'temp');
            // Ensure uploads directory exists
            await fs.mkdir(uploadsDir, { recursive: true }).catch(() => { });
            const fileBuffer = await fs.readFile(file.path);
            try {
                const result = await this.productsService.importFromExcel(fileBuffer);
                // Clean up temp file
                await fs.unlink(file.path).catch(() => { });
                return result;
            }
            catch (error) {
                // Clean up temp file on error
                await fs.unlink(file.path).catch(() => { });
                throw error;
            }
        }
        async downloadExcelTemplate(res) {
            const buffer = this.productsService.generateExcelTemplate();
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename="products-template.xlsx"');
            res.send(buffer);
        }
    };
    return ProductsController = _classThis;
})();
exports.ProductsController = ProductsController;
//# sourceMappingURL=products.controller.js.map