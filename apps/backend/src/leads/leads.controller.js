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
exports.LeadsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const rbac_guard_1 = require("../common/guards/rbac.guard");
const permissions_decorator_1 = require("../common/decorators/permissions.decorator");
const public_decorator_1 = require("../common/decorators/public.decorator");
let LeadsController = (() => {
    let _classDecorators = [(0, swagger_1.ApiTags)('public', 'admin'), (0, common_1.Controller)('leads')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _create_decorators;
    let _findAll_decorators;
    let _getTelegramButtonStats_decorators;
    let _findOne_decorators;
    let _update_decorators;
    let _remove_decorators;
    let _telegramWebhook_decorators;
    var LeadsController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _create_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Post)(), (0, swagger_1.ApiOperation)({ summary: 'Create lead (public)' })];
            _findAll_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard), (0, common_1.Get)(), (0, permissions_decorator_1.RequirePermissions)('leads.read'), (0, swagger_1.ApiBearerAuth)(), (0, swagger_1.ApiOperation)({ summary: 'Get all leads' })];
            _getTelegramButtonStats_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard), (0, common_1.Get)('stats/telegram-button'), (0, permissions_decorator_1.RequirePermissions)('leads.read'), (0, swagger_1.ApiBearerAuth)(), (0, swagger_1.ApiOperation)({ summary: 'Get Telegram button click statistics' })];
            _findOne_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard), (0, common_1.Get)(':id'), (0, permissions_decorator_1.RequirePermissions)('leads.read'), (0, swagger_1.ApiBearerAuth)(), (0, swagger_1.ApiOperation)({ summary: 'Get lead by ID' })];
            _update_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard), (0, common_1.Patch)(':id'), (0, permissions_decorator_1.RequirePermissions)('leads.read'), (0, swagger_1.ApiBearerAuth)(), (0, swagger_1.ApiOperation)({ summary: 'Update lead' })];
            _remove_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard), (0, common_1.Delete)(':id'), (0, permissions_decorator_1.RequirePermissions)('leads.read'), (0, swagger_1.ApiBearerAuth)(), (0, swagger_1.ApiOperation)({ summary: 'Delete lead' })];
            _telegramWebhook_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Post)('telegram-webhook'), (0, swagger_1.ApiOperation)({ summary: 'Telegram webhook endpoint for button bot' })];
            __esDecorate(this, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getTelegramButtonStats_decorators, { kind: "method", name: "getTelegramButtonStats", static: false, private: false, access: { has: obj => "getTelegramButtonStats" in obj, get: obj => obj.getTelegramButtonStats }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findOne_decorators, { kind: "method", name: "findOne", static: false, private: false, access: { has: obj => "findOne" in obj, get: obj => obj.findOne }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _remove_decorators, { kind: "method", name: "remove", static: false, private: false, access: { has: obj => "remove" in obj, get: obj => obj.remove }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _telegramWebhook_decorators, { kind: "method", name: "telegramWebhook", static: false, private: false, access: { has: obj => "telegramWebhook" in obj, get: obj => obj.telegramWebhook }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            LeadsController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        leadsService = __runInitializers(this, _instanceExtraInitializers);
        telegramService;
        constructor(leadsService, telegramService) {
            this.leadsService = leadsService;
            this.telegramService = telegramService;
        }
        async create(createDto) {
            // Track Telegram button clicks
            const data = createDto;
            if (data.source === 'telegram_button_click') {
                // Create a minimal lead entry for tracking
                return this.leadsService.create({
                    name: 'Telegram Button Click',
                    phone: 'N/A',
                    source: 'telegram_button_click',
                    message: 'User clicked Telegram button',
                });
            }
            return this.leadsService.create(createDto);
        }
        findAll() {
            return this.leadsService.findAll();
        }
        getTelegramButtonStats() {
            return this.leadsService.getTelegramButtonStats();
        }
        findOne(id) {
            return this.leadsService.findOne(id);
        }
        update(id, updateDto) {
            return this.leadsService.update(id, updateDto);
        }
        remove(id) {
            return this.leadsService.delete(id);
        }
        async telegramWebhook(update) {
            try {
                // Only process messages
                if (!update.message) {
                    return { ok: true };
                }
                const { message } = update;
                const chatId = message.chat.id;
                const userId = message.from.id;
                const firstName = message.from.first_name || '';
                const lastName = message.from.last_name || '';
                const username = message.from.username || '';
                const fullName = [firstName, lastName].filter(Boolean).join(' ') || username || `User ${userId}`;
                // Extract phone number from contact or text
                let phone = '';
                if (message.contact?.phone_number) {
                    phone = message.contact.phone_number;
                }
                else if (message.text) {
                    // Try to extract phone number from text
                    const phoneMatch = message.text.match(/\+?998\d{9}|\d{9}/);
                    if (phoneMatch) {
                        phone = phoneMatch[0].startsWith('+') ? phoneMatch[0] : `+998${phoneMatch[0]}`;
                    }
                }
                // Extract message text
                const messageText = message.text || message.contact?.phone_number || '';
                // If we have at least a name or phone, create a lead
                if (fullName || phone) {
                    // Create lead in database
                    // Note: Telegram button leads are stored in database but not sent to Telegram forms bot
                    // (they are handled separately if needed)
                    await this.leadsService.create({
                        name: fullName,
                        phone: phone || 'N/A',
                        source: 'telegram_button',
                        message: messageText,
                    });
                    // Optionally send confirmation back to user
                    const buttonBot = await this.telegramService.getButtonBot();
                    if (buttonBot && phone) {
                        try {
                            await buttonBot.sendMessage(chatId, '✅ Xabaringiz qabul qilindi! Tez orada siz bilan bog\'lanamiz.', { parse_mode: 'HTML' });
                        }
                        catch (error) {
                            console.error('Failed to send confirmation message:', error);
                        }
                    }
                }
                return { ok: true };
            }
            catch (error) {
                console.error('Telegram webhook error:', error);
                return { ok: true }; // Always return ok to prevent Telegram from retrying
            }
        }
    };
    return LeadsController = _classThis;
})();
exports.LeadsController = LeadsController;
//# sourceMappingURL=leads.controller.js.map