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
exports.HomepageController = void 0;
const common_1 = require("@nestjs/common");
const public_decorator_1 = require("../common/decorators/public.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const rbac_guard_1 = require("../common/guards/rbac.guard");
const permissions_decorator_1 = require("../common/decorators/permissions.decorator");
const swagger_1 = require("@nestjs/swagger");
let HomepageController = (() => {
    let _classDecorators = [(0, swagger_1.ApiTags)('public', 'admin'), (0, common_1.Controller)('homepage')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _findPublicHearingAids_decorators;
    let _findAllHearingAids_decorators;
    let _createHearingAid_decorators;
    let _updateHearingAid_decorators;
    let _deleteHearingAid_decorators;
    let _findPublicJourney_decorators;
    let _findAllJourney_decorators;
    let _createJourney_decorators;
    let _updateJourney_decorators;
    let _deleteJourney_decorators;
    let _findPublicNews_decorators;
    let _findAllNews_decorators;
    let _createNews_decorators;
    let _updateNews_decorators;
    let _deleteNews_decorators;
    let _findPublicServices_decorators;
    let _findAllServices_decorators;
    let _createService_decorators;
    let _updateService_decorators;
    let _deleteService_decorators;
    var HomepageController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
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
            _findPublicServices_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Get)('services')];
            _findAllServices_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard), (0, common_1.Get)('services/admin'), (0, permissions_decorator_1.RequirePermissions)('content.read'), (0, swagger_1.ApiBearerAuth)()];
            _createService_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard), (0, common_1.Post)('services'), (0, permissions_decorator_1.RequirePermissions)('content.write'), (0, swagger_1.ApiBearerAuth)()];
            _updateService_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard), (0, common_1.Patch)('services/:id'), (0, permissions_decorator_1.RequirePermissions)('content.write'), (0, swagger_1.ApiBearerAuth)()];
            _deleteService_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard), (0, common_1.Delete)('services/:id'), (0, permissions_decorator_1.RequirePermissions)('content.write'), (0, swagger_1.ApiBearerAuth)()];
            __esDecorate(this, null, _findPublicHearingAids_decorators, { kind: "method", name: "findPublicHearingAids", static: false, private: false, access: { has: obj => "findPublicHearingAids" in obj, get: obj => obj.findPublicHearingAids }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findAllHearingAids_decorators, { kind: "method", name: "findAllHearingAids", static: false, private: false, access: { has: obj => "findAllHearingAids" in obj, get: obj => obj.findAllHearingAids }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _createHearingAid_decorators, { kind: "method", name: "createHearingAid", static: false, private: false, access: { has: obj => "createHearingAid" in obj, get: obj => obj.createHearingAid }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateHearingAid_decorators, { kind: "method", name: "updateHearingAid", static: false, private: false, access: { has: obj => "updateHearingAid" in obj, get: obj => obj.updateHearingAid }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _deleteHearingAid_decorators, { kind: "method", name: "deleteHearingAid", static: false, private: false, access: { has: obj => "deleteHearingAid" in obj, get: obj => obj.deleteHearingAid }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findPublicJourney_decorators, { kind: "method", name: "findPublicJourney", static: false, private: false, access: { has: obj => "findPublicJourney" in obj, get: obj => obj.findPublicJourney }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findAllJourney_decorators, { kind: "method", name: "findAllJourney", static: false, private: false, access: { has: obj => "findAllJourney" in obj, get: obj => obj.findAllJourney }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _createJourney_decorators, { kind: "method", name: "createJourney", static: false, private: false, access: { has: obj => "createJourney" in obj, get: obj => obj.createJourney }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateJourney_decorators, { kind: "method", name: "updateJourney", static: false, private: false, access: { has: obj => "updateJourney" in obj, get: obj => obj.updateJourney }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _deleteJourney_decorators, { kind: "method", name: "deleteJourney", static: false, private: false, access: { has: obj => "deleteJourney" in obj, get: obj => obj.deleteJourney }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findPublicNews_decorators, { kind: "method", name: "findPublicNews", static: false, private: false, access: { has: obj => "findPublicNews" in obj, get: obj => obj.findPublicNews }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findAllNews_decorators, { kind: "method", name: "findAllNews", static: false, private: false, access: { has: obj => "findAllNews" in obj, get: obj => obj.findAllNews }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _createNews_decorators, { kind: "method", name: "createNews", static: false, private: false, access: { has: obj => "createNews" in obj, get: obj => obj.createNews }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateNews_decorators, { kind: "method", name: "updateNews", static: false, private: false, access: { has: obj => "updateNews" in obj, get: obj => obj.updateNews }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _deleteNews_decorators, { kind: "method", name: "deleteNews", static: false, private: false, access: { has: obj => "deleteNews" in obj, get: obj => obj.deleteNews }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findPublicServices_decorators, { kind: "method", name: "findPublicServices", static: false, private: false, access: { has: obj => "findPublicServices" in obj, get: obj => obj.findPublicServices }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findAllServices_decorators, { kind: "method", name: "findAllServices", static: false, private: false, access: { has: obj => "findAllServices" in obj, get: obj => obj.findAllServices }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _createService_decorators, { kind: "method", name: "createService", static: false, private: false, access: { has: obj => "createService" in obj, get: obj => obj.createService }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateService_decorators, { kind: "method", name: "updateService", static: false, private: false, access: { has: obj => "updateService" in obj, get: obj => obj.updateService }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _deleteService_decorators, { kind: "method", name: "deleteService", static: false, private: false, access: { has: obj => "deleteService" in obj, get: obj => obj.deleteService }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            HomepageController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        homepage = __runInitializers(this, _instanceExtraInitializers);
        constructor(homepage) {
            this.homepage = homepage;
        }
        findPublicHearingAids() {
            return this.homepage.findHearingAids(true);
        }
        findAllHearingAids() {
            return this.homepage.findHearingAids(false);
        }
        createHearingAid(dto) {
            return this.homepage.createHearingAid(dto);
        }
        updateHearingAid(id, dto) {
            return this.homepage.updateHearingAid(id, dto);
        }
        deleteHearingAid(id) {
            return this.homepage.deleteHearingAid(id);
        }
        findPublicJourney() {
            return this.homepage.findJourney(true);
        }
        findAllJourney() {
            return this.homepage.findJourney(false);
        }
        createJourney(dto) {
            return this.homepage.createJourneyStep(dto);
        }
        updateJourney(id, dto) {
            return this.homepage.updateJourneyStep(id, dto);
        }
        deleteJourney(id) {
            return this.homepage.deleteJourneyStep(id);
        }
        findPublicNews() {
            return this.homepage.findNews(true);
        }
        findAllNews() {
            return this.homepage.findNews(false);
        }
        createNews(dto) {
            return this.homepage.createNewsItem(dto);
        }
        updateNews(id, dto) {
            return this.homepage.updateNewsItem(id, dto);
        }
        deleteNews(id) {
            return this.homepage.deleteNewsItem(id);
        }
        findPublicServices() {
            return this.homepage.findServices(true);
        }
        findAllServices() {
            return this.homepage.findServices(false);
        }
        createService(dto) {
            return this.homepage.createService(dto);
        }
        updateService(id, dto) {
            return this.homepage.updateService(id, dto);
        }
        deleteService(id) {
            return this.homepage.deleteService(id);
        }
    };
    return HomepageController = _classThis;
})();
exports.HomepageController = HomepageController;
//# sourceMappingURL=homepage.controller.js.map