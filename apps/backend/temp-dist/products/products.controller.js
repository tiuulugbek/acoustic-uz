"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsController = void 0;
var common_1 = require("@nestjs/common");
var swagger_1 = require("@nestjs/swagger");
var jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
var rbac_guard_1 = require("../common/guards/rbac.guard");
var permissions_decorator_1 = require("../common/decorators/permissions.decorator");
var public_decorator_1 = require("../common/decorators/public.decorator");
var ProductsController = function () {
    var _classDecorators = [(0, swagger_1.ApiTags)('public', 'admin'), (0, common_1.Controller)('products')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _findAll_decorators;
    var _findBySlug_decorators;
    var _findAllAdmin_decorators;
    var _findOne_decorators;
    var _create_decorators;
    var _update_decorators;
    var _remove_decorators;
    var ProductsController = _classThis = /** @class */ (function () {
        function ProductsController_1(productsService) {
            this.productsService = (__runInitializers(this, _instanceExtraInitializers), productsService);
        }
        ProductsController_1.prototype.findAll = function (filters) {
            return this.productsService.findAll(__assign(__assign({}, filters), { status: 'published' }));
        };
        ProductsController_1.prototype.findBySlug = function (slug) {
            return this.productsService.findBySlug(slug);
        };
        ProductsController_1.prototype.findAllAdmin = function (filters) {
            return this.productsService.findAll(filters);
        };
        ProductsController_1.prototype.findOne = function (id) {
            return this.productsService.findOne(id);
        };
        ProductsController_1.prototype.create = function (createDto) {
            return this.productsService.create(createDto);
        };
        ProductsController_1.prototype.update = function (id, updateDto) {
            return this.productsService.update(id, updateDto);
        };
        ProductsController_1.prototype.remove = function (id) {
            return this.productsService.delete(id);
        };
        return ProductsController_1;
    }());
    __setFunctionName(_classThis, "ProductsController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _findAll_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Get)(), (0, swagger_1.ApiOperation)({ summary: 'Get all products (public)' })];
        _findBySlug_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Get)('slug/:slug'), (0, swagger_1.ApiOperation)({ summary: 'Get product by slug (public)' })];
        _findAllAdmin_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard), (0, common_1.Get)('admin'), (0, permissions_decorator_1.RequirePermissions)('content.read'), (0, swagger_1.ApiBearerAuth)()];
        _findOne_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard), (0, common_1.Get)('admin/:id'), (0, permissions_decorator_1.RequirePermissions)('content.read'), (0, swagger_1.ApiBearerAuth)()];
        _create_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard), (0, common_1.Post)(), (0, permissions_decorator_1.RequirePermissions)('content.write'), (0, swagger_1.ApiBearerAuth)()];
        _update_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard), (0, common_1.Patch)(':id'), (0, permissions_decorator_1.RequirePermissions)('content.write'), (0, swagger_1.ApiBearerAuth)()];
        _remove_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard), (0, common_1.Delete)(':id'), (0, permissions_decorator_1.RequirePermissions)('content.write'), (0, swagger_1.ApiBearerAuth)()];
        __esDecorate(_classThis, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: function (obj) { return "findAll" in obj; }, get: function (obj) { return obj.findAll; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findBySlug_decorators, { kind: "method", name: "findBySlug", static: false, private: false, access: { has: function (obj) { return "findBySlug" in obj; }, get: function (obj) { return obj.findBySlug; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findAllAdmin_decorators, { kind: "method", name: "findAllAdmin", static: false, private: false, access: { has: function (obj) { return "findAllAdmin" in obj; }, get: function (obj) { return obj.findAllAdmin; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findOne_decorators, { kind: "method", name: "findOne", static: false, private: false, access: { has: function (obj) { return "findOne" in obj; }, get: function (obj) { return obj.findOne; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: function (obj) { return "create" in obj; }, get: function (obj) { return obj.create; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: function (obj) { return "update" in obj; }, get: function (obj) { return obj.update; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _remove_decorators, { kind: "method", name: "remove", static: false, private: false, access: { has: function (obj) { return "remove" in obj; }, get: function (obj) { return obj.remove; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ProductsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ProductsController = _classThis;
}();
exports.ProductsController = ProductsController;
