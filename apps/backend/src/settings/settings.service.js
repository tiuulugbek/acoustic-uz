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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const toJsonValue = (value) => {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return client_1.Prisma.JsonNull;
    }
    // Deep clone and ensure proper JSON serialization
    try {
        // Use JSON.parse/stringify to ensure proper serialization
        // This handles nested null values correctly
        const serialized = JSON.parse(JSON.stringify(value));
        return serialized;
    }
    catch (error) {
        console.error('JSON serialization error:', error);
        console.error('Value that failed:', value);
        // Fallback to direct cast
        return value;
    }
};
let SettingsService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var SettingsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            SettingsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        constructor(prisma) {
            this.prisma = prisma;
        }
        async get() {
            let settings = await this.prisma.setting.findUnique({
                where: { id: 'singleton' },
                include: { catalogHeroImage: true, logo: true, favicon: true },
            });
            if (!settings) {
                settings = await this.prisma.setting.create({
                    data: { id: 'singleton' },
                    include: { catalogHeroImage: true, logo: true, favicon: true },
                });
            }
            return settings;
        }
        async update(data) {
            try {
                // Extract only valid Prisma fields
                const { featureFlags, socialLinks, sidebarSections, sidebarConfigs, catalogHeroImageId, logoId, faviconId, sidebarBrandIds, phonePrimary, phoneSecondary, email, telegramBotToken, telegramChatId, telegramButtonBotToken, telegramButtonBotUsername, telegramButtonMessage_uz, telegramButtonMessage_ru, brandPrimary, brandAccent, } = data;
                // Clean sidebarConfigs: ensure proper JSON serialization
                let cleanedSidebarConfigs = sidebarConfigs;
                if (sidebarConfigs && typeof sidebarConfigs === 'object') {
                    try {
                        // Deep clone and ensure all values are JSON-serializable
                        cleanedSidebarConfigs = JSON.parse(JSON.stringify(sidebarConfigs));
                        console.log('Cleaned sidebarConfigs:', JSON.stringify(cleanedSidebarConfigs, null, 2));
                    }
                    catch (error) {
                        console.error('Error cleaning sidebarConfigs:', error);
                        throw new Error(`Invalid sidebarConfigs format: ${error instanceof Error ? error.message : String(error)}`);
                    }
                }
                const jsonFields = {
                    ...(featureFlags !== undefined ? { featureFlags: toJsonValue(featureFlags) } : {}),
                    ...(socialLinks !== undefined ? { socialLinks: toJsonValue(socialLinks) } : {}),
                    ...(sidebarSections !== undefined ? { sidebarSections: toJsonValue(sidebarSections) } : {}),
                    ...(cleanedSidebarConfigs !== undefined ? { sidebarConfigs: toJsonValue(cleanedSidebarConfigs) } : {}),
                };
                console.log('JSON fields prepared:', {
                    sidebarConfigs: cleanedSidebarConfigs ? 'present' : 'undefined',
                    sidebarConfigsType: cleanedSidebarConfigs ? typeof cleanedSidebarConfigs : 'undefined',
                });
                // Helper function to normalize string values (empty strings become undefined)
                const normalizeString = (value) => {
                    if (value === null || value === undefined)
                        return undefined;
                    const trimmed = value.trim();
                    return trimmed === '' ? undefined : trimmed;
                };
                // Debug: Log incoming values
                console.log('🔵 [Settings] Incoming values:', {
                    telegramBotToken: telegramBotToken ? '***SET***' : 'undefined',
                    telegramChatId: telegramChatId || 'undefined',
                    telegramButtonBotToken: telegramButtonBotToken ? '***SET***' : 'undefined',
                    telegramButtonBotUsername: telegramButtonBotUsername || 'undefined',
                    telegramButtonMessage_uz: telegramButtonMessage_uz ? 'SET' : 'undefined',
                    telegramButtonMessage_ru: telegramButtonMessage_ru ? 'SET' : 'undefined',
                });
                // Build update object with only valid Prisma fields
                // IMPORTANT: Always include fields if they are in the request, even if normalized to undefined
                // This allows clearing fields by sending empty strings
                const updateData = {};
                if (phonePrimary !== undefined) {
                    const normalized = normalizeString(phonePrimary);
                    if (normalized !== undefined)
                        updateData.phonePrimary = normalized;
                }
                if (phoneSecondary !== undefined) {
                    const normalized = normalizeString(phoneSecondary);
                    if (normalized !== undefined)
                        updateData.phoneSecondary = normalized;
                }
                if (email !== undefined) {
                    const normalized = normalizeString(email);
                    if (normalized !== undefined)
                        updateData.email = normalized;
                }
                if (telegramBotToken !== undefined) {
                    const normalized = normalizeString(telegramBotToken);
                    if (normalized !== undefined)
                        updateData.telegramBotToken = normalized;
                }
                if (telegramChatId !== undefined) {
                    const normalized = normalizeString(telegramChatId);
                    if (normalized !== undefined)
                        updateData.telegramChatId = normalized;
                }
                if (telegramButtonBotToken !== undefined) {
                    const normalized = normalizeString(telegramButtonBotToken);
                    console.log('🔵 [Settings] telegramButtonBotToken normalized:', normalized ? '***SET***' : 'undefined');
                    if (normalized !== undefined)
                        updateData.telegramButtonBotToken = normalized;
                }
                if (telegramButtonBotUsername !== undefined) {
                    const normalized = normalizeString(telegramButtonBotUsername);
                    console.log('🔵 [Settings] telegramButtonBotUsername normalized:', normalized || 'undefined');
                    if (normalized !== undefined)
                        updateData.telegramButtonBotUsername = normalized;
                }
                if (telegramButtonMessage_uz !== undefined) {
                    const normalized = normalizeString(telegramButtonMessage_uz);
                    console.log('🔵 [Settings] telegramButtonMessage_uz normalized:', normalized ? 'SET' : 'undefined');
                    if (normalized !== undefined)
                        updateData.telegramButtonMessage_uz = normalized;
                }
                if (telegramButtonMessage_ru !== undefined) {
                    const normalized = normalizeString(telegramButtonMessage_ru);
                    console.log('🔵 [Settings] telegramButtonMessage_ru normalized:', normalized ? 'SET' : 'undefined');
                    if (normalized !== undefined)
                        updateData.telegramButtonMessage_ru = normalized;
                }
                // Add other fields
                if (brandPrimary !== undefined)
                    updateData.brandPrimary = brandPrimary;
                if (brandAccent !== undefined)
                    updateData.brandAccent = brandAccent;
                // Add JSON fields
                Object.assign(updateData, jsonFields);
                if (catalogHeroImageId !== undefined)
                    updateData.catalogHeroImageId = catalogHeroImageId || null;
                if (logoId !== undefined)
                    updateData.logoId = logoId || null;
                if (faviconId !== undefined)
                    updateData.faviconId = faviconId || null;
                if (sidebarBrandIds !== undefined)
                    updateData.sidebarBrandIds = sidebarBrandIds || [];
                console.log('🔵 [Settings] Update data keys:', Object.keys(updateData));
                console.log('🔵 [Settings] Update data values:', {
                    telegramBotToken: updateData.telegramBotToken ? '***SET***' : 'undefined',
                    telegramChatId: updateData.telegramChatId || 'undefined',
                    telegramButtonBotToken: updateData.telegramButtonBotToken ? '***SET***' : 'undefined',
                    telegramButtonBotUsername: updateData.telegramButtonBotUsername || 'undefined',
                    telegramButtonMessage_uz: updateData.telegramButtonMessage_uz ? 'SET' : 'undefined',
                    telegramButtonMessage_ru: updateData.telegramButtonMessage_ru ? 'SET' : 'undefined',
                });
                return this.prisma.setting.upsert({
                    where: { id: 'singleton' },
                    update: updateData,
                    create: {
                        id: 'singleton',
                        ...updateData,
                    },
                    include: { catalogHeroImage: true, logo: true, favicon: true },
                });
            }
            catch (error) {
                console.error('Settings update error:', error);
                if (error instanceof Error) {
                    console.error('Error message:', error.message);
                    console.error('Error stack:', error.stack);
                }
                // Re-throw with more context
                if (error instanceof Error) {
                    throw new Error(`Failed to update settings: ${error.message}`);
                }
                throw error;
            }
        }
    };
    return SettingsService = _classThis;
})();
exports.SettingsService = SettingsService;
//# sourceMappingURL=settings.service.js.map