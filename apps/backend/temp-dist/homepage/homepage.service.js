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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomepageService = void 0;
var common_1 = require("@nestjs/common");
var shared_1 = require("@acoustic/shared");
var HomepageService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var HomepageService = _classThis = /** @class */ (function () {
        function HomepageService_1(prisma) {
            this.prisma = prisma;
        }
        Object.defineProperty(HomepageService_1.prototype, "client", {
            get: function () {
                return this.prisma;
            },
            enumerable: false,
            configurable: true
        });
        HomepageService_1.prototype.findHearingAids = function () {
            return __awaiter(this, arguments, void 0, function (publicOnly) {
                if (publicOnly === void 0) { publicOnly = false; }
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.client.homepageHearingAid.findMany({
                            where: publicOnly ? { status: 'published' } : {},
                            include: { image: true },
                            orderBy: [{ order: 'asc' }, { updatedAt: 'desc' }],
                        })];
                });
            });
        };
        HomepageService_1.prototype.createHearingAid = function (data) {
            return __awaiter(this, void 0, void 0, function () {
                var validated;
                var _a;
                return __generator(this, function (_b) {
                    validated = shared_1.homepageHearingAidSchema.parse(data);
                    return [2 /*return*/, this.client.homepageHearingAid.create({
                            data: __assign(__assign({}, validated), { imageId: (_a = validated.imageId) !== null && _a !== void 0 ? _a : undefined }),
                            include: { image: true },
                        })];
                });
            });
        };
        HomepageService_1.prototype.updateHearingAid = function (id, data) {
            return __awaiter(this, void 0, void 0, function () {
                var validated;
                var _a;
                return __generator(this, function (_b) {
                    validated = shared_1.homepageHearingAidSchema.partial().parse(data);
                    return [2 /*return*/, this.client.homepageHearingAid.update({
                            where: { id: id },
                            data: __assign(__assign({}, validated), (validated.imageId !== undefined ? { imageId: (_a = validated.imageId) !== null && _a !== void 0 ? _a : null } : {})),
                            include: { image: true },
                        })];
                });
            });
        };
        HomepageService_1.prototype.deleteHearingAid = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.client.homepageHearingAid.delete({ where: { id: id } })];
                });
            });
        };
        HomepageService_1.prototype.findJourney = function () {
            return __awaiter(this, arguments, void 0, function (publicOnly) {
                if (publicOnly === void 0) { publicOnly = false; }
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.client.homepageJourneyStep.findMany({
                            where: publicOnly ? { status: 'published' } : {},
                            orderBy: [{ order: 'asc' }, { updatedAt: 'desc' }],
                        })];
                });
            });
        };
        HomepageService_1.prototype.createJourneyStep = function (data) {
            return __awaiter(this, void 0, void 0, function () {
                var validated;
                return __generator(this, function (_a) {
                    validated = shared_1.homepageJourneyStepSchema.parse(data);
                    return [2 /*return*/, this.client.homepageJourneyStep.create({ data: validated })];
                });
            });
        };
        HomepageService_1.prototype.updateJourneyStep = function (id, data) {
            return __awaiter(this, void 0, void 0, function () {
                var validated;
                return __generator(this, function (_a) {
                    validated = shared_1.homepageJourneyStepSchema.partial().parse(data);
                    return [2 /*return*/, this.client.homepageJourneyStep.update({
                            where: { id: id },
                            data: validated,
                        })];
                });
            });
        };
        HomepageService_1.prototype.deleteJourneyStep = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.client.homepageJourneyStep.delete({ where: { id: id } })];
                });
            });
        };
        HomepageService_1.prototype.findNews = function () {
            return __awaiter(this, arguments, void 0, function (publicOnly) {
                if (publicOnly === void 0) { publicOnly = false; }
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.client.homepageNewsItem.findMany({
                            where: publicOnly ? { status: 'published' } : {},
                            include: { post: true },
                            orderBy: [{ order: 'asc' }, { updatedAt: 'desc' }],
                        })];
                });
            });
        };
        HomepageService_1.prototype.createNewsItem = function (data) {
            return __awaiter(this, void 0, void 0, function () {
                var validated;
                var _a, _b, _c;
                return __generator(this, function (_d) {
                    validated = shared_1.homepageNewsItemSchema.parse(data);
                    return [2 /*return*/, this.client.homepageNewsItem.create({
                            data: __assign(__assign({}, validated), { postId: (_a = validated.postId) !== null && _a !== void 0 ? _a : undefined, slug: (_b = validated.slug) !== null && _b !== void 0 ? _b : undefined, publishedAt: (_c = validated.publishedAt) !== null && _c !== void 0 ? _c : undefined }),
                            include: { post: true },
                        })];
                });
            });
        };
        HomepageService_1.prototype.updateNewsItem = function (id, data) {
            return __awaiter(this, void 0, void 0, function () {
                var validated;
                var _a, _b, _c;
                return __generator(this, function (_d) {
                    validated = shared_1.homepageNewsItemSchema.partial().parse(data);
                    return [2 /*return*/, this.client.homepageNewsItem.update({
                            where: { id: id },
                            data: __assign(__assign(__assign(__assign({}, validated), (validated.postId !== undefined ? { postId: (_a = validated.postId) !== null && _a !== void 0 ? _a : null } : {})), (validated.slug !== undefined ? { slug: (_b = validated.slug) !== null && _b !== void 0 ? _b : null } : {})), (validated.publishedAt !== undefined
                                ? { publishedAt: (_c = validated.publishedAt) !== null && _c !== void 0 ? _c : null }
                                : {})),
                            include: { post: true },
                        })];
                });
            });
        };
        HomepageService_1.prototype.deleteNewsItem = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.client.homepageNewsItem.delete({ where: { id: id } })];
                });
            });
        };
        return HomepageService_1;
    }());
    __setFunctionName(_classThis, "HomepageService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        HomepageService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return HomepageService = _classThis;
}();
exports.HomepageService = HomepageService;
