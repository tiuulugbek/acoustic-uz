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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomepageController = void 0;
var common_1 = require("@nestjs/common");
var public_decorator_1 = require("../common/decorators/public.decorator");
var jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
var rbac_guard_1 = require("../common/guards/rbac.guard");
var permissions_decorator_1 = require("../common/decorators/permissions.decorator");
var swagger_1 = require("@nestjs/swagger");
var HomepageController = function () {
    var _classDecorators = [(0, swagger_1.ApiTags)('public', 'admin'), (0, common_1.Controller)('homepage')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _findPublicHearingAids_decorators;
    var _findAllHearingAids_decorators;
    var _createHearingAid_decorators;
    var _updateHearingAid_decorators;
    var _deleteHearingAid_decorators;
    var _findPublicJourney_decorators;
    var _findAllJourney_decorators;
    var _createJourney_decorators;
    var _updateJourney_decorators;
    var _deleteJourney_decorators;
    var _findPublicNews_decorators;
    var _findAllNews_decorators;
    var _createNews_decorators;
    var _updateNews_decorators;
    var _deleteNews_decorators;
    var HomepageController = _classThis = /** @class */ (function () {
        function HomepageController_1(homepage) {
            this.homepage = (__runInitializers(this, _instanceExtraInitializers), homepage);
        }
        HomepageController_1.prototype.findPublicHearingAids = function () {
            return this.homepage.findHearingAids(true);
        };
        HomepageController_1.prototype.findAllHearingAids = function () {
            return this.homepage.findHearingAids(false);
        };
        HomepageController_1.prototype.createHearingAid = function (dto) {
            return this.homepage.createHearingAid(dto);
        };
        HomepageController_1.prototype.updateHearingAid = function (id, dto) {
            return this.homepage.updateHearingAid(id, dto);
        };
        HomepageController_1.prototype.deleteHearingAid = function (id) {
            return this.homepage.deleteHearingAid(id);
        };
        HomepageController_1.prototype.findPublicJourney = function () {
            return this.homepage.findJourney(true);
        };
        HomepageController_1.prototype.findAllJourney = function () {
            return this.homepage.findJourney(false);
        };
        HomepageController_1.prototype.createJourney = function (dto) {
            return this.homepage.createJourneyStep(dto);
        };
        HomepageController_1.prototype.updateJourney = function (id, dto) {
            return this.homepage.updateJourneyStep(id, dto);
        };
        HomepageController_1.prototype.deleteJourney = function (id) {
            return this.homepage.deleteJourneyStep(id);
        };
        HomepageController_1.prototype.findPublicNews = function () {
            return this.homepage.findNews(true);
        };
        HomepageController_1.prototype.findAllNews = function () {
            return this.homepage.findNews(false);
        };
        HomepageController_1.prototype.createNews = function (dto) {
            return this.homepage.createNewsItem(dto);
        };
        HomepageController_1.prototype.updateNews = function (id, dto) {
            return this.homepage.updateNewsItem(id, dto);
        };
        HomepageController_1.prototype.deleteNews = function (id) {
            return this.homepage.deleteNewsItem(id);
        };
        return HomepageController_1;
    }());
    __setFunctionName(_classThis, "HomepageController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _findPublicHearingAids_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Get)('hearing-aids')];
        _findAllHearingAids_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard), (0, common_1.Get)('hearing-aids/admin'), (0, permissions_decorator_1.RequirePermissions)('content.read'), (0, swagger_1.ApiBearerAuth)()];
        _createHearingAid_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard), (0, common_1.Post)('hearing-aids'), (0, permissions_decorator_1.RequirePermissions)('content.write'), (0, swagger_1.ApiBearerAuth)()];
        _updateHearingAid_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard), (0, common_1.Patch)('hearing-aids/:id'), (0, permissions_decorator_1.RequirePermissions)('content.write'), (0, swagger_1.ApiBearerAuth)()];
        _deleteHearingAid_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard), (0, common_1.Delete)('hearing-aids/:id'), (0, permissions_decorator_1.RequirePermissions)('content.write'), (0, swagger_1.ApiBearerAuth)()];
        _findPublicJourney_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Get)('journey')];
        _findAllJourney_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard), (0, common_1.Get)('journey/admin'), (0, permissions_decorator_1.RequirePermissions)('content.read'), (0, swagger_1.ApiBearerAuth)()];
        _createJourney_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard), (0, common_1.Post)('journey'), (0, permissions_decorator_1.RequirePermissions)('content.write'), (0, swagger_1.ApiBearerAuth)()];
        _updateJourney_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard), (0, common_1.Patch)('journey/:id'), (0, permissions_decorator_1.RequirePermissions)('content.write'), (0, swagger_1.ApiBearerAuth)()];
        _deleteJourney_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard), (0, common_1.Delete)('journey/:id'), (0, permissions_decorator_1.RequirePermissions)('content.write'), (0, swagger_1.ApiBearerAuth)()];
        _findPublicNews_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Get)('news')];
        _findAllNews_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard), (0, common_1.Get)('news/admin'), (0, permissions_decorator_1.RequirePermissions)('content.read'), (0, swagger_1.ApiBearerAuth)()];
        _createNews_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard), (0, common_1.Post)('news'), (0, permissions_decorator_1.RequirePermissions)('content.write'), (0, swagger_1.ApiBearerAuth)()];
        _updateNews_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard), (0, common_1.Patch)('news/:id'), (0, permissions_decorator_1.RequirePermissions)('content.write'), (0, swagger_1.ApiBearerAuth)()];
        _deleteNews_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard), (0, common_1.Delete)('news/:id'), (0, permissions_decorator_1.RequirePermissions)('content.write'), (0, swagger_1.ApiBearerAuth)()];
        __esDecorate(_classThis, null, _findPublicHearingAids_decorators, { kind: "method", name: "findPublicHearingAids", static: false, private: false, access: { has: function (obj) { return "findPublicHearingAids" in obj; }, get: function (obj) { return obj.findPublicHearingAids; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findAllHearingAids_decorators, { kind: "method", name: "findAllHearingAids", static: false, private: false, access: { has: function (obj) { return "findAllHearingAids" in obj; }, get: function (obj) { return obj.findAllHearingAids; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createHearingAid_decorators, { kind: "method", name: "createHearingAid", static: false, private: false, access: { has: function (obj) { return "createHearingAid" in obj; }, get: function (obj) { return obj.createHearingAid; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateHearingAid_decorators, { kind: "method", name: "updateHearingAid", static: false, private: false, access: { has: function (obj) { return "updateHearingAid" in obj; }, get: function (obj) { return obj.updateHearingAid; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _deleteHearingAid_decorators, { kind: "method", name: "deleteHearingAid", static: false, private: false, access: { has: function (obj) { return "deleteHearingAid" in obj; }, get: function (obj) { return obj.deleteHearingAid; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findPublicJourney_decorators, { kind: "method", name: "findPublicJourney", static: false, private: false, access: { has: function (obj) { return "findPublicJourney" in obj; }, get: function (obj) { return obj.findPublicJourney; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findAllJourney_decorators, { kind: "method", name: "findAllJourney", static: false, private: false, access: { has: function (obj) { return "findAllJourney" in obj; }, get: function (obj) { return obj.findAllJourney; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createJourney_decorators, { kind: "method", name: "createJourney", static: false, private: false, access: { has: function (obj) { return "createJourney" in obj; }, get: function (obj) { return obj.createJourney; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateJourney_decorators, { kind: "method", name: "updateJourney", static: false, private: false, access: { has: function (obj) { return "updateJourney" in obj; }, get: function (obj) { return obj.updateJourney; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _deleteJourney_decorators, { kind: "method", name: "deleteJourney", static: false, private: false, access: { has: function (obj) { return "deleteJourney" in obj; }, get: function (obj) { return obj.deleteJourney; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findPublicNews_decorators, { kind: "method", name: "findPublicNews", static: false, private: false, access: { has: function (obj) { return "findPublicNews" in obj; }, get: function (obj) { return obj.findPublicNews; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findAllNews_decorators, { kind: "method", name: "findAllNews", static: false, private: false, access: { has: function (obj) { return "findAllNews" in obj; }, get: function (obj) { return obj.findAllNews; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createNews_decorators, { kind: "method", name: "createNews", static: false, private: false, access: { has: function (obj) { return "createNews" in obj; }, get: function (obj) { return obj.createNews; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateNews_decorators, { kind: "method", name: "updateNews", static: false, private: false, access: { has: function (obj) { return "updateNews" in obj; }, get: function (obj) { return obj.updateNews; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _deleteNews_decorators, { kind: "method", name: "deleteNews", static: false, private: false, access: { has: function (obj) { return "deleteNews" in obj; }, get: function (obj) { return obj.deleteNews; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        HomepageController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return HomepageController = _classThis;
}();
exports.HomepageController = HomepageController;
