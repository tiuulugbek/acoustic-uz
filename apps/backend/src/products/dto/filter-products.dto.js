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
exports.FilterProductsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
let FilterProductsDto = (() => {
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    let _brandId_decorators;
    let _brandId_initializers = [];
    let _brandId_extraInitializers = [];
    let _categoryId_decorators;
    let _categoryId_initializers = [];
    let _categoryId_extraInitializers = [];
    let _catalogId_decorators;
    let _catalogId_initializers = [];
    let _catalogId_extraInitializers = [];
    let _productType_decorators;
    let _productType_initializers = [];
    let _productType_extraInitializers = [];
    let _search_decorators;
    let _search_initializers = [];
    let _search_extraInitializers = [];
    let _audience_decorators;
    let _audience_initializers = [];
    let _audience_extraInitializers = [];
    let _formFactor_decorators;
    let _formFactor_initializers = [];
    let _formFactor_extraInitializers = [];
    let _signalProcessing_decorators;
    let _signalProcessing_initializers = [];
    let _signalProcessing_extraInitializers = [];
    let _powerLevel_decorators;
    let _powerLevel_initializers = [];
    let _powerLevel_extraInitializers = [];
    let _hearingLossLevel_decorators;
    let _hearingLossLevel_initializers = [];
    let _hearingLossLevel_extraInitializers = [];
    let _smartphoneCompatibility_decorators;
    let _smartphoneCompatibility_initializers = [];
    let _smartphoneCompatibility_extraInitializers = [];
    let _paymentOption_decorators;
    let _paymentOption_initializers = [];
    let _paymentOption_extraInitializers = [];
    let _availabilityStatus_decorators;
    let _availabilityStatus_initializers = [];
    let _availabilityStatus_extraInitializers = [];
    let _limit_decorators;
    let _limit_initializers = [];
    let _limit_extraInitializers = [];
    let _offset_decorators;
    let _offset_initializers = [];
    let _offset_extraInitializers = [];
    let _sort_decorators;
    let _sort_initializers = [];
    let _sort_extraInitializers = [];
    return class FilterProductsDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _status_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Mahsulot holati' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _brandId_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Brend ID' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _categoryId_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Kategoriya ID' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _catalogId_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Katalog ID' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _productType_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Mahsulot turi' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _search_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Qidiruv so\'rovi' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _audience_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Auditoriya' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _formFactor_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Korpus turi' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _signalProcessing_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Signal qayta ishlash' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _powerLevel_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Quvvat darajasi' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _hearingLossLevel_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Eshitish yo\'qotish darajasi' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _smartphoneCompatibility_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Smartfon mosligi' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _paymentOption_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'To\'lov usuli' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _availabilityStatus_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Mavjudlik holati' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _limit_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Sahifadagi mahsulotlar soni', default: 12 }), (0, class_validator_1.IsOptional)(), (0, class_transformer_1.Type)(() => Number), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(1)];
            _offset_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'O\'tkazib yuborilgan mahsulotlar soni', default: 0 }), (0, class_validator_1.IsOptional)(), (0, class_transformer_1.Type)(() => Number), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _sort_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Tartiblash', enum: ['newest', 'price_asc', 'price_desc'], default: 'newest' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(['newest', 'price_asc', 'price_desc'])];
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _brandId_decorators, { kind: "field", name: "brandId", static: false, private: false, access: { has: obj => "brandId" in obj, get: obj => obj.brandId, set: (obj, value) => { obj.brandId = value; } }, metadata: _metadata }, _brandId_initializers, _brandId_extraInitializers);
            __esDecorate(null, null, _categoryId_decorators, { kind: "field", name: "categoryId", static: false, private: false, access: { has: obj => "categoryId" in obj, get: obj => obj.categoryId, set: (obj, value) => { obj.categoryId = value; } }, metadata: _metadata }, _categoryId_initializers, _categoryId_extraInitializers);
            __esDecorate(null, null, _catalogId_decorators, { kind: "field", name: "catalogId", static: false, private: false, access: { has: obj => "catalogId" in obj, get: obj => obj.catalogId, set: (obj, value) => { obj.catalogId = value; } }, metadata: _metadata }, _catalogId_initializers, _catalogId_extraInitializers);
            __esDecorate(null, null, _productType_decorators, { kind: "field", name: "productType", static: false, private: false, access: { has: obj => "productType" in obj, get: obj => obj.productType, set: (obj, value) => { obj.productType = value; } }, metadata: _metadata }, _productType_initializers, _productType_extraInitializers);
            __esDecorate(null, null, _search_decorators, { kind: "field", name: "search", static: false, private: false, access: { has: obj => "search" in obj, get: obj => obj.search, set: (obj, value) => { obj.search = value; } }, metadata: _metadata }, _search_initializers, _search_extraInitializers);
            __esDecorate(null, null, _audience_decorators, { kind: "field", name: "audience", static: false, private: false, access: { has: obj => "audience" in obj, get: obj => obj.audience, set: (obj, value) => { obj.audience = value; } }, metadata: _metadata }, _audience_initializers, _audience_extraInitializers);
            __esDecorate(null, null, _formFactor_decorators, { kind: "field", name: "formFactor", static: false, private: false, access: { has: obj => "formFactor" in obj, get: obj => obj.formFactor, set: (obj, value) => { obj.formFactor = value; } }, metadata: _metadata }, _formFactor_initializers, _formFactor_extraInitializers);
            __esDecorate(null, null, _signalProcessing_decorators, { kind: "field", name: "signalProcessing", static: false, private: false, access: { has: obj => "signalProcessing" in obj, get: obj => obj.signalProcessing, set: (obj, value) => { obj.signalProcessing = value; } }, metadata: _metadata }, _signalProcessing_initializers, _signalProcessing_extraInitializers);
            __esDecorate(null, null, _powerLevel_decorators, { kind: "field", name: "powerLevel", static: false, private: false, access: { has: obj => "powerLevel" in obj, get: obj => obj.powerLevel, set: (obj, value) => { obj.powerLevel = value; } }, metadata: _metadata }, _powerLevel_initializers, _powerLevel_extraInitializers);
            __esDecorate(null, null, _hearingLossLevel_decorators, { kind: "field", name: "hearingLossLevel", static: false, private: false, access: { has: obj => "hearingLossLevel" in obj, get: obj => obj.hearingLossLevel, set: (obj, value) => { obj.hearingLossLevel = value; } }, metadata: _metadata }, _hearingLossLevel_initializers, _hearingLossLevel_extraInitializers);
            __esDecorate(null, null, _smartphoneCompatibility_decorators, { kind: "field", name: "smartphoneCompatibility", static: false, private: false, access: { has: obj => "smartphoneCompatibility" in obj, get: obj => obj.smartphoneCompatibility, set: (obj, value) => { obj.smartphoneCompatibility = value; } }, metadata: _metadata }, _smartphoneCompatibility_initializers, _smartphoneCompatibility_extraInitializers);
            __esDecorate(null, null, _paymentOption_decorators, { kind: "field", name: "paymentOption", static: false, private: false, access: { has: obj => "paymentOption" in obj, get: obj => obj.paymentOption, set: (obj, value) => { obj.paymentOption = value; } }, metadata: _metadata }, _paymentOption_initializers, _paymentOption_extraInitializers);
            __esDecorate(null, null, _availabilityStatus_decorators, { kind: "field", name: "availabilityStatus", static: false, private: false, access: { has: obj => "availabilityStatus" in obj, get: obj => obj.availabilityStatus, set: (obj, value) => { obj.availabilityStatus = value; } }, metadata: _metadata }, _availabilityStatus_initializers, _availabilityStatus_extraInitializers);
            __esDecorate(null, null, _limit_decorators, { kind: "field", name: "limit", static: false, private: false, access: { has: obj => "limit" in obj, get: obj => obj.limit, set: (obj, value) => { obj.limit = value; } }, metadata: _metadata }, _limit_initializers, _limit_extraInitializers);
            __esDecorate(null, null, _offset_decorators, { kind: "field", name: "offset", static: false, private: false, access: { has: obj => "offset" in obj, get: obj => obj.offset, set: (obj, value) => { obj.offset = value; } }, metadata: _metadata }, _offset_initializers, _offset_extraInitializers);
            __esDecorate(null, null, _sort_decorators, { kind: "field", name: "sort", static: false, private: false, access: { has: obj => "sort" in obj, get: obj => obj.sort, set: (obj, value) => { obj.sort = value; } }, metadata: _metadata }, _sort_initializers, _sort_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        status = __runInitializers(this, _status_initializers, void 0);
        brandId = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _brandId_initializers, void 0));
        categoryId = (__runInitializers(this, _brandId_extraInitializers), __runInitializers(this, _categoryId_initializers, void 0));
        catalogId = (__runInitializers(this, _categoryId_extraInitializers), __runInitializers(this, _catalogId_initializers, void 0));
        productType = (__runInitializers(this, _catalogId_extraInitializers), __runInitializers(this, _productType_initializers, void 0));
        search = (__runInitializers(this, _productType_extraInitializers), __runInitializers(this, _search_initializers, void 0));
        audience = (__runInitializers(this, _search_extraInitializers), __runInitializers(this, _audience_initializers, void 0));
        formFactor = (__runInitializers(this, _audience_extraInitializers), __runInitializers(this, _formFactor_initializers, void 0));
        signalProcessing = (__runInitializers(this, _formFactor_extraInitializers), __runInitializers(this, _signalProcessing_initializers, void 0));
        powerLevel = (__runInitializers(this, _signalProcessing_extraInitializers), __runInitializers(this, _powerLevel_initializers, void 0));
        hearingLossLevel = (__runInitializers(this, _powerLevel_extraInitializers), __runInitializers(this, _hearingLossLevel_initializers, void 0));
        smartphoneCompatibility = (__runInitializers(this, _hearingLossLevel_extraInitializers), __runInitializers(this, _smartphoneCompatibility_initializers, void 0));
        paymentOption = (__runInitializers(this, _smartphoneCompatibility_extraInitializers), __runInitializers(this, _paymentOption_initializers, void 0));
        availabilityStatus = (__runInitializers(this, _paymentOption_extraInitializers), __runInitializers(this, _availabilityStatus_initializers, void 0));
        limit = (__runInitializers(this, _availabilityStatus_extraInitializers), __runInitializers(this, _limit_initializers, void 0));
        offset = (__runInitializers(this, _limit_extraInitializers), __runInitializers(this, _offset_initializers, void 0));
        sort = (__runInitializers(this, _offset_extraInitializers), __runInitializers(this, _sort_initializers, void 0));
        constructor() {
            __runInitializers(this, _sort_extraInitializers);
        }
    };
})();
exports.FilterProductsDto = FilterProductsDto;
//# sourceMappingURL=filter-products.dto.js.map