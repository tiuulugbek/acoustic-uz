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
exports.ProductsService = void 0;
var common_1 = require("@nestjs/common");
var shared_1 = require("@acoustic/shared");
var ProductsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var ProductsService = _classThis = /** @class */ (function () {
        function ProductsService_1(prisma) {
            this.prisma = prisma;
        }
        ProductsService_1.prototype.findAll = function (filters) {
            return __awaiter(this, void 0, void 0, function () {
                var where;
                return __generator(this, function (_a) {
                    where = {};
                    if (filters === null || filters === void 0 ? void 0 : filters.status)
                        where.status = filters.status;
                    if (filters === null || filters === void 0 ? void 0 : filters.brandId)
                        where.brandId = filters.brandId;
                    if (filters === null || filters === void 0 ? void 0 : filters.categoryId)
                        where.categoryId = filters.categoryId;
                    if (filters === null || filters === void 0 ? void 0 : filters.search) {
                        where.OR = [
                            { name_uz: { contains: filters.search, mode: 'insensitive' } },
                            { name_ru: { contains: filters.search, mode: 'insensitive' } },
                            { description_uz: { contains: filters.search, mode: 'insensitive' } },
                            { description_ru: { contains: filters.search, mode: 'insensitive' } },
                            { specsText: { contains: filters.search, mode: 'insensitive' } },
                        ];
                    }
                    if (filters === null || filters === void 0 ? void 0 : filters.audience)
                        where.audience = { has: filters.audience };
                    if (filters === null || filters === void 0 ? void 0 : filters.formFactor)
                        where.formFactors = { has: filters.formFactor };
                    if (filters === null || filters === void 0 ? void 0 : filters.signalProcessing)
                        where.signalProcessing = filters.signalProcessing;
                    if (filters === null || filters === void 0 ? void 0 : filters.powerLevel)
                        where.powerLevel = filters.powerLevel;
                    if (filters === null || filters === void 0 ? void 0 : filters.hearingLossLevel)
                        where.hearingLossLevels = { has: filters.hearingLossLevel };
                    if (filters === null || filters === void 0 ? void 0 : filters.smartphoneCompatibility)
                        where.smartphoneCompatibility = { has: filters.smartphoneCompatibility };
                    if (filters === null || filters === void 0 ? void 0 : filters.paymentOption)
                        where.paymentOptions = { has: filters.paymentOption };
                    if (filters === null || filters === void 0 ? void 0 : filters.availabilityStatus)
                        where.availabilityStatus = filters.availabilityStatus;
                    return [2 /*return*/, this.prisma.product.findMany({
                            where: where,
                            include: { brand: true, category: true },
                            orderBy: { createdAt: 'desc' },
                        })];
                });
            });
        };
        ProductsService_1.prototype.findOne = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var product;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.product.findUnique({
                                where: { id: id },
                                include: { brand: true, category: true },
                            })];
                        case 1:
                            product = _a.sent();
                            if (!product) {
                                throw new common_1.NotFoundException('Product not found');
                            }
                            return [2 /*return*/, product];
                    }
                });
            });
        };
        ProductsService_1.prototype.findBySlug = function (slug) {
            return __awaiter(this, void 0, void 0, function () {
                var product, relatedProducts, _a, usefulArticles, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, this.prisma.product.findUnique({
                                where: { slug: slug, status: 'published' },
                                include: { brand: true, category: true },
                            })];
                        case 1:
                            product = _c.sent();
                            if (!product) {
                                throw new common_1.NotFoundException('Product not found');
                            }
                            if (!product.relatedProductIds.length) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.prisma.product.findMany({
                                    where: { id: { in: product.relatedProductIds }, status: 'published' },
                                    include: { brand: true, category: true },
                                })];
                        case 2:
                            _a = _c.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            _a = [];
                            _c.label = 4;
                        case 4:
                            relatedProducts = _a;
                            if (!product.usefulArticleSlugs.length) return [3 /*break*/, 6];
                            return [4 /*yield*/, this.prisma.post.findMany({
                                    where: { slug: { in: product.usefulArticleSlugs }, status: 'published' },
                                    select: {
                                        id: true,
                                        title_uz: true,
                                        title_ru: true,
                                        slug: true,
                                        excerpt_uz: true,
                                        excerpt_ru: true,
                                    },
                                })];
                        case 5:
                            _b = _c.sent();
                            return [3 /*break*/, 7];
                        case 6:
                            _b = [];
                            _c.label = 7;
                        case 7:
                            usefulArticles = _b;
                            return [2 /*return*/, __assign(__assign({}, product), { relatedProducts: relatedProducts, usefulArticles: usefulArticles })];
                    }
                });
            });
        };
        ProductsService_1.prototype.create = function (data) {
            return __awaiter(this, void 0, void 0, function () {
                var validated, createData;
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8;
                return __generator(this, function (_9) {
                    validated = shared_1.productSchema.parse(data);
                    createData = {
                        name_uz: validated.name_uz,
                        name_ru: validated.name_ru,
                        slug: validated.slug,
                        description_uz: (_a = validated.description_uz) !== null && _a !== void 0 ? _a : null,
                        description_ru: (_b = validated.description_ru) !== null && _b !== void 0 ? _b : null,
                        price: (_c = validated.price) !== null && _c !== void 0 ? _c : undefined,
                        stock: (_d = validated.stock) !== null && _d !== void 0 ? _d : undefined,
                        brandId: (_e = validated.brandId) !== null && _e !== void 0 ? _e : undefined,
                        categoryId: (_f = validated.categoryId) !== null && _f !== void 0 ? _f : undefined,
                        specsText: (_g = validated.specsText) !== null && _g !== void 0 ? _g : null,
                        galleryIds: (_h = validated.galleryIds) !== null && _h !== void 0 ? _h : [],
                        audience: (_j = validated.audience) !== null && _j !== void 0 ? _j : [],
                        formFactors: (_k = validated.formFactors) !== null && _k !== void 0 ? _k : [],
                        signalProcessing: (_l = validated.signalProcessing) !== null && _l !== void 0 ? _l : undefined,
                        powerLevel: (_m = validated.powerLevel) !== null && _m !== void 0 ? _m : undefined,
                        hearingLossLevels: (_o = validated.hearingLossLevels) !== null && _o !== void 0 ? _o : [],
                        smartphoneCompatibility: (_p = validated.smartphoneCompatibility) !== null && _p !== void 0 ? _p : [],
                        tinnitusSupport: validated.tinnitusSupport === undefined ? undefined : (_q = validated.tinnitusSupport) !== null && _q !== void 0 ? _q : false,
                        paymentOptions: (_r = validated.paymentOptions) !== null && _r !== void 0 ? _r : [],
                        availabilityStatus: (_s = validated.availabilityStatus) !== null && _s !== void 0 ? _s : undefined,
                        intro_uz: (_t = validated.intro_uz) !== null && _t !== void 0 ? _t : null,
                        intro_ru: (_u = validated.intro_ru) !== null && _u !== void 0 ? _u : null,
                        features_uz: (_v = validated.features_uz) !== null && _v !== void 0 ? _v : [],
                        features_ru: (_w = validated.features_ru) !== null && _w !== void 0 ? _w : [],
                        benefits_uz: (_x = validated.benefits_uz) !== null && _x !== void 0 ? _x : [],
                        benefits_ru: (_y = validated.benefits_ru) !== null && _y !== void 0 ? _y : [],
                        tech_uz: (_z = validated.tech_uz) !== null && _z !== void 0 ? _z : null,
                        tech_ru: (_0 = validated.tech_ru) !== null && _0 !== void 0 ? _0 : null,
                        fittingRange_uz: (_1 = validated.fittingRange_uz) !== null && _1 !== void 0 ? _1 : null,
                        fittingRange_ru: (_2 = validated.fittingRange_ru) !== null && _2 !== void 0 ? _2 : null,
                        regulatoryNote_uz: (_3 = validated.regulatoryNote_uz) !== null && _3 !== void 0 ? _3 : null,
                        regulatoryNote_ru: (_4 = validated.regulatoryNote_ru) !== null && _4 !== void 0 ? _4 : null,
                        galleryUrls: (_5 = validated.galleryUrls) !== null && _5 !== void 0 ? _5 : [],
                        relatedProductIds: (_6 = validated.relatedProductIds) !== null && _6 !== void 0 ? _6 : [],
                        usefulArticleSlugs: (_7 = validated.usefulArticleSlugs) !== null && _7 !== void 0 ? _7 : [],
                        status: (_8 = validated.status) !== null && _8 !== void 0 ? _8 : 'published',
                    };
                    return [2 /*return*/, this.prisma.product.create({
                            data: createData,
                            include: { brand: true, category: true },
                        })];
                });
            });
        };
        ProductsService_1.prototype.update = function (id, data) {
            return __awaiter(this, void 0, void 0, function () {
                var validated, updateData;
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
                return __generator(this, function (_v) {
                    validated = shared_1.productSchema.partial().parse(data);
                    updateData = {};
                    if (validated.name_uz !== undefined)
                        updateData.name_uz = validated.name_uz;
                    if (validated.name_ru !== undefined)
                        updateData.name_ru = validated.name_ru;
                    if (validated.slug !== undefined)
                        updateData.slug = validated.slug;
                    if (validated.description_uz !== undefined)
                        updateData.description_uz = (_a = validated.description_uz) !== null && _a !== void 0 ? _a : null;
                    if (validated.description_ru !== undefined)
                        updateData.description_ru = (_b = validated.description_ru) !== null && _b !== void 0 ? _b : null;
                    if (validated.price !== undefined)
                        updateData.price = (_c = validated.price) !== null && _c !== void 0 ? _c : null;
                    if (validated.stock !== undefined)
                        updateData.stock = (_d = validated.stock) !== null && _d !== void 0 ? _d : null;
                    if (validated.brandId !== undefined)
                        updateData.brandId = (_e = validated.brandId) !== null && _e !== void 0 ? _e : null;
                    if (validated.categoryId !== undefined)
                        updateData.categoryId = (_f = validated.categoryId) !== null && _f !== void 0 ? _f : null;
                    if (validated.status !== undefined)
                        updateData.status = validated.status;
                    if (validated.specsText !== undefined) {
                        updateData.specsText = (_g = validated.specsText) !== null && _g !== void 0 ? _g : null;
                    }
                    if (validated.galleryIds !== undefined) {
                        updateData.galleryIds = { set: validated.galleryIds };
                    }
                    if (validated.audience !== undefined) {
                        updateData.audience = { set: validated.audience };
                    }
                    if (validated.formFactors !== undefined) {
                        updateData.formFactors = { set: validated.formFactors };
                    }
                    if (validated.signalProcessing !== undefined) {
                        updateData.signalProcessing = (_h = validated.signalProcessing) !== null && _h !== void 0 ? _h : null;
                    }
                    if (validated.powerLevel !== undefined) {
                        updateData.powerLevel = (_j = validated.powerLevel) !== null && _j !== void 0 ? _j : null;
                    }
                    if (validated.hearingLossLevels !== undefined) {
                        updateData.hearingLossLevels = { set: validated.hearingLossLevels };
                    }
                    if (validated.smartphoneCompatibility !== undefined) {
                        updateData.smartphoneCompatibility = { set: validated.smartphoneCompatibility };
                    }
                    if (validated.tinnitusSupport !== undefined) {
                        updateData.tinnitusSupport = (_k = validated.tinnitusSupport) !== null && _k !== void 0 ? _k : false;
                    }
                    if (validated.paymentOptions !== undefined) {
                        updateData.paymentOptions = { set: validated.paymentOptions };
                    }
                    if (validated.availabilityStatus !== undefined) {
                        updateData.availabilityStatus = (_l = validated.availabilityStatus) !== null && _l !== void 0 ? _l : null;
                    }
                    if (validated.intro_uz !== undefined)
                        updateData.intro_uz = (_m = validated.intro_uz) !== null && _m !== void 0 ? _m : null;
                    if (validated.intro_ru !== undefined)
                        updateData.intro_ru = (_o = validated.intro_ru) !== null && _o !== void 0 ? _o : null;
                    if (validated.features_uz !== undefined) {
                        updateData.features_uz = { set: validated.features_uz };
                    }
                    if (validated.features_ru !== undefined) {
                        updateData.features_ru = { set: validated.features_ru };
                    }
                    if (validated.benefits_uz !== undefined) {
                        updateData.benefits_uz = { set: validated.benefits_uz };
                    }
                    if (validated.benefits_ru !== undefined) {
                        updateData.benefits_ru = { set: validated.benefits_ru };
                    }
                    if (validated.tech_uz !== undefined)
                        updateData.tech_uz = (_p = validated.tech_uz) !== null && _p !== void 0 ? _p : null;
                    if (validated.tech_ru !== undefined)
                        updateData.tech_ru = (_q = validated.tech_ru) !== null && _q !== void 0 ? _q : null;
                    if (validated.fittingRange_uz !== undefined)
                        updateData.fittingRange_uz = (_r = validated.fittingRange_uz) !== null && _r !== void 0 ? _r : null;
                    if (validated.fittingRange_ru !== undefined)
                        updateData.fittingRange_ru = (_s = validated.fittingRange_ru) !== null && _s !== void 0 ? _s : null;
                    if (validated.regulatoryNote_uz !== undefined)
                        updateData.regulatoryNote_uz = (_t = validated.regulatoryNote_uz) !== null && _t !== void 0 ? _t : null;
                    if (validated.regulatoryNote_ru !== undefined)
                        updateData.regulatoryNote_ru = (_u = validated.regulatoryNote_ru) !== null && _u !== void 0 ? _u : null;
                    if (validated.galleryUrls !== undefined) {
                        updateData.galleryUrls = { set: validated.galleryUrls };
                    }
                    if (validated.relatedProductIds !== undefined) {
                        updateData.relatedProductIds = { set: validated.relatedProductIds };
                    }
                    if (validated.usefulArticleSlugs !== undefined) {
                        updateData.usefulArticleSlugs = { set: validated.usefulArticleSlugs };
                    }
                    return [2 /*return*/, this.prisma.product.update({
                            where: { id: id },
                            data: updateData,
                            include: { brand: true, category: true },
                        })];
                });
            });
        };
        ProductsService_1.prototype.delete = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.product.delete({
                            where: { id: id },
                        })];
                });
            });
        };
        return ProductsService_1;
    }());
    __setFunctionName(_classThis, "ProductsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ProductsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ProductsService = _classThis;
}();
exports.ProductsService = ProductsService;
