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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramService = void 0;
const common_1 = require("@nestjs/common");
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
let TelegramService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var TelegramService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            TelegramService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        configService;
        settingsService;
        formsBot = null; // Bot for forms (sends to Telegram)
        buttonBot = null; // Bot for button (receives messages, sends to AmoCRM)
        constructor(configService, settingsService) {
            this.configService = configService;
            this.settingsService = settingsService;
        }
        /**
         * Send lead to Telegram (forms bot)
         * Used for website forms - sends to Telegram chat
         */
        async sendLead(lead) {
            try {
                const settings = await this.settingsService.get();
                if (!settings.telegramBotToken || !settings.telegramChatId) {
                    return false;
                }
                if (!this.formsBot) {
                    this.formsBot = new node_telegram_bot_api_1.default(settings.telegramBotToken);
                }
                // Format source as hashtag for better analytics
                const sourceHashtag = lead.source
                    ? `#${lead.source.replace(/[^a-zA-Z0-9_]/g, '_')}`
                    : '';
                const message = `
🆕 *Yangi so'rov*
👤 *Ism:* ${lead.name}
📞 *Telefon:* ${lead.phone}
${lead.email ? `📧 *Email:* ${lead.email}\n` : ''}
${sourceHashtag ? `${sourceHashtag}\n` : ''}
${lead.message ? `💬 *Xabar:* ${lead.message}\n` : ''}
${lead.productId ? `🛍️ *Mahsulot ID:* ${lead.productId}\n` : ''}
      `.trim();
                await this.formsBot.sendMessage(settings.telegramChatId, message, {
                    parse_mode: 'Markdown',
                });
                return true;
            }
            catch (error) {
                console.error('Telegram send error:', error);
                return false;
            }
        }
        /**
         * Get button bot instance (for webhook)
         * Used to receive messages from Telegram button bot
         */
        async getButtonBot() {
            const settings = await this.settingsService.get();
            if (!settings.telegramButtonBotToken) {
                return null;
            }
            if (!this.buttonBot) {
                this.buttonBot = new node_telegram_bot_api_1.default(settings.telegramButtonBotToken);
            }
            return this.buttonBot;
        }
        /**
         * Get button bot username
         */
        async getButtonBotUsername() {
            const settings = await this.settingsService.get();
            return settings.telegramButtonBotUsername || null;
        }
        /**
         * Send lead status update to Telegram
         * Used when admin updates lead status in admin panel
         */
        async sendLeadStatusUpdate(lead) {
            try {
                const settings = await this.settingsService.get();
                if (!settings.telegramBotToken || !settings.telegramChatId) {
                    return false;
                }
                if (!this.formsBot) {
                    this.formsBot = new node_telegram_bot_api_1.default(settings.telegramBotToken);
                }
                const statusLabels = {
                    new: '🆕 Yangi',
                    in_progress: '⏳ Ko\'rib chiqilmoqda',
                    completed: '✅ Yakunlangan',
                    cancelled: '❌ Bekor qilingan',
                };
                const oldStatusLabel = lead.oldStatus ? statusLabels[lead.oldStatus] || lead.oldStatus : 'Noma\'lum';
                const newStatusLabel = lead.status ? statusLabels[lead.status] || lead.status : 'Noma\'lum';
                const message = `
🔄 *Lead holati yangilandi*
👤 *Ism:* ${lead.name}
📞 *Telefon:* ${lead.phone}
📋 *Eski holat:* ${oldStatusLabel}
📋 *Yangi holat:* ${newStatusLabel}
🆔 *ID:* ${lead.id.slice(0, 8)}...
      `.trim();
                await this.formsBot.sendMessage(settings.telegramChatId, message, {
                    parse_mode: 'Markdown',
                });
                return true;
            }
            catch (error) {
                console.error('Telegram status update error:', error);
                return false;
            }
        }
        /**
         * Send lead deletion notification to Telegram
         * Used when admin deletes a lead in admin panel
         */
        async sendLeadDeletion(lead) {
            try {
                const settings = await this.settingsService.get();
                if (!settings.telegramBotToken || !settings.telegramChatId) {
                    return false;
                }
                if (!this.formsBot) {
                    this.formsBot = new node_telegram_bot_api_1.default(settings.telegramBotToken);
                }
                // Format source as hashtag
                const sourceHashtag = lead.source
                    ? `#${lead.source.replace(/[^a-zA-Z0-9_]/g, '_')}`
                    : '';
                const message = `
🗑️ *Lead o'chirildi*
👤 *Ism:* ${lead.name}
📞 *Telefon:* ${lead.phone}
${sourceHashtag ? `${sourceHashtag}\n` : ''}🆔 *ID:* ${lead.id.slice(0, 8)}...
      `.trim();
                await this.formsBot.sendMessage(settings.telegramChatId, message, {
                    parse_mode: 'Markdown',
                });
                return true;
            }
            catch (error) {
                console.error('Telegram deletion notification error:', error);
                return false;
            }
        }
    };
    return TelegramService = _classThis;
})();
exports.TelegramService = TelegramService;
//# sourceMappingURL=telegram.service.js.map