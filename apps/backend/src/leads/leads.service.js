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
exports.LeadsService = void 0;
const common_1 = require("@nestjs/common");
const shared_1 = require("@acoustic/shared");
let LeadsService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var LeadsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            LeadsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        telegramService;
        constructor(prisma, telegramService) {
            this.prisma = prisma;
            this.telegramService = telegramService;
        }
        async findAll() {
            return this.prisma.lead.findMany({
                orderBy: { createdAt: 'desc' },
            });
        }
        async getTelegramButtonStats() {
            // Count both telegram_button and telegram_button_click sources
            const sourceFilter = {
                OR: [
                    { source: 'telegram_button' },
                    { source: 'telegram_button_click' },
                ],
            };
            const totalClicks = await this.prisma.lead.count({
                where: sourceFilter,
            });
            const todayClicks = await this.prisma.lead.count({
                where: {
                    ...sourceFilter,
                    createdAt: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    },
                },
            });
            const thisWeekClicks = await this.prisma.lead.count({
                where: {
                    ...sourceFilter,
                    createdAt: {
                        gte: new Date(new Date().setDate(new Date().getDate() - 7)),
                    },
                },
            });
            const thisMonthClicks = await this.prisma.lead.count({
                where: {
                    ...sourceFilter,
                    createdAt: {
                        gte: new Date(new Date().setDate(1)),
                    },
                },
            });
            return {
                total: totalClicks,
                today: todayClicks,
                thisWeek: thisWeekClicks,
                thisMonth: thisMonthClicks,
            };
        }
        async findOne(id) {
            return this.prisma.lead.findUnique({
                where: { id },
            });
        }
        async create(data) {
            const validated = shared_1.leadSchema.parse(data);
            const lead = await this.prisma.lead.create({
                data: validated,
            });
            // Send to Telegram forms bot (for all form sources)
            // All leads from website forms go to Telegram bot
            // Don't send telegram_button_click events to Telegram (they're just for tracking)
            if (lead.source !== 'telegram_button' && lead.source !== 'telegram_button_click') {
                try {
                    await this.telegramService.sendLead(lead);
                }
                catch (error) {
                    console.error('Failed to send lead to Telegram:', error);
                }
            }
            return lead;
        }
        async update(id, data) {
            // Get old lead data before update
            const oldLead = await this.prisma.lead.findUnique({
                where: { id },
            });
            const updatedLead = await this.prisma.lead.update({
                where: { id },
                data,
            });
            // Send status update notification to Telegram if status changed
            if (oldLead && data.status && oldLead.status !== data.status) {
                try {
                    await this.telegramService.sendLeadStatusUpdate({
                        id: updatedLead.id,
                        name: updatedLead.name,
                        phone: updatedLead.phone,
                        status: updatedLead.status,
                        oldStatus: oldLead.status,
                    });
                }
                catch (error) {
                    console.error('Failed to send lead status update to Telegram:', error);
                }
            }
            return updatedLead;
        }
        async delete(id) {
            // Get lead data before deletion
            const lead = await this.prisma.lead.findUnique({
                where: { id },
            });
            if (!lead) {
                throw new Error('Lead not found');
            }
            // Delete the lead
            const deletedLead = await this.prisma.lead.delete({
                where: { id },
            });
            // Send deletion notification to Telegram
            try {
                await this.telegramService.sendLeadDeletion({
                    id: deletedLead.id,
                    name: deletedLead.name,
                    phone: deletedLead.phone,
                    source: deletedLead.source,
                });
            }
            catch (error) {
                console.error('Failed to send lead deletion notification to Telegram:', error);
            }
            return deletedLead;
        }
    };
    return LeadsService = _classThis;
})();
exports.LeadsService = LeadsService;
//# sourceMappingURL=leads.service.js.map