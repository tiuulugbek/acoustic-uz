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
exports.ServicesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const rbac_guard_1 = require("../common/guards/rbac.guard");
const permissions_decorator_1 = require("../common/decorators/permissions.decorator");
const public_decorator_1 = require("../common/decorators/public.decorator");
let ServicesController = (() => {
    let _classDecorators = [(0, swagger_1.ApiTags)('public', 'admin'), (0, common_1.Controller)('services')];
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
    var ServicesController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _findAll_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Get)(), (0, swagger_1.ApiOperation)({ summary: 'Get all services (public)' })];
            _findBySlug_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Get)('slug/:slug'), (0, swagger_1.ApiOperation)({ summary: 'Get service by slug (public)' })];
            _findAllAdmin_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard), (0, common_1.Get)('admin'), (0, permissions_decorator_1.RequirePermissions)('content.read'), (0, swagger_1.ApiBearerAuth)()];
            _findOne_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard), (0, common_1.Get)('admin/:id'), (0, permissions_decorator_1.RequirePermissions)('content.read'), (0, swagger_1.ApiBearerAuth)()];
            _create_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard), (0, common_1.Post)(), (0, permissions_decorator_1.RequirePermissions)('content.write'), (0, swagger_1.ApiBearerAuth)()];
            _update_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard), (0, common_1.Patch)(':id'), (0, permissions_decorator_1.RequirePermissions)('content.write'), (0, swagger_1.ApiBearerAuth)()];
            _remove_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard), (0, common_1.Delete)(':id'), (0, permissions_decorator_1.RequirePermissions)('content.write'), (0, swagger_1.ApiBearerAuth)()];
            __esDecorate(this, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findBySlug_decorators, { kind: "method", name: "findBySlug", static: false, private: false, access: { has: obj => "findBySlug" in obj, get: obj => obj.findBySlug }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findAllAdmin_decorators, { kind: "method", name: "findAllAdmin", static: false, private: false, access: { has: obj => "findAllAdmin" in obj, get: obj => obj.findAllAdmin }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findOne_decorators, { kind: "method", name: "findOne", static: false, private: false, access: { has: obj => "findOne" in obj, get: obj => obj.findOne }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _remove_decorators, { kind: "method", name: "remove", static: false, private: false, access: { has: obj => "remove" in obj, get: obj => obj.remove }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ServicesController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        servicesService = __runInitializers(this, _instanceExtraInitializers);
        constructor(servicesService) {
            this.servicesService = servicesService;
        }
        findAll(publicOnly, categoryId) {
            return this.servicesService.findAll(publicOnly === 'true', categoryId);
        }
        findBySlug(slug) {
            return this.servicesService.findBySlug(slug);
        }
        findAllAdmin() {
            return this.servicesService.findAll(false);
        }
        findOne(id) {
            return this.servicesService.findOne(id);
        }
        create(createDto) {
            return this.servicesService.create(createDto);
        }
        update(id, updateDto) {
            return this.servicesService.update(id, updateDto);
        }
        remove(id) {
            return this.servicesService.delete(id);
        }
    };
    return ServicesController = _classThis;
})();
exports.ServicesController = ServicesController;
//# sourceMappingURL=services.controller.js.map