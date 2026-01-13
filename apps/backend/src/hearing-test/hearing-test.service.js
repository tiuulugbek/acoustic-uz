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
exports.HearingTestService = void 0;
const common_1 = require("@nestjs/common");
const shared_1 = require("@acoustic/shared");
let HearingTestService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var HearingTestService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            HearingTestService = _classThis = _classDescriptor.value;
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
            return this.prisma.hearingTest.findMany({
                orderBy: { createdAt: 'desc' },
            });
        }
        async findOne(id) {
            return this.prisma.hearingTest.findUnique({
                where: { id },
            });
        }
        /**
         * Calculate hearing score based on test results (volume levels)
         * Lower volume needed = better hearing
         */
        calculateScore(results) {
            const frequencies = ['250', '500', '1000', '2000', '4000', '8000'];
            if (frequencies.length === 0)
                return 0;
            let totalScore = 0;
            for (const freq of frequencies) {
                const volume = results[freq];
                if (volume === undefined || volume === null)
                    continue;
                // Assuming 1.0 is perfect hearing (no volume needed), 0.0 is no hearing
                // Score is inverse of volume needed to barely hear
                // Lower volume = higher score
                totalScore += (1 - volume) * (100 / frequencies.length);
            }
            return Math.round(totalScore);
        }
        /**
         * Determine hearing level based on score
         */
        getHearingLevel(score) {
            if (score >= 90)
                return 'normal';
            if (score >= 70)
                return 'mild';
            if (score >= 50)
                return 'moderate';
            if (score >= 30)
                return 'severe';
            return 'profound';
        }
        async create(data) {
            const validated = shared_1.hearingTestSchema.parse(data);
            // Calculate scores if not provided
            // Type assertion: Zod schema ensures these are Record<string, number>
            // Convert via unknown to satisfy TypeScript strict type checking
            const leftEarScore = validated.leftEarScore ?? this.calculateScore(validated.leftEarResults);
            const rightEarScore = validated.rightEarScore ?? this.calculateScore(validated.rightEarResults);
            const overallScore = validated.overallScore ?? Math.round((leftEarScore + rightEarScore) / 2);
            // Determine hearing levels
            const leftEarLevel = validated.leftEarLevel ?? this.getHearingLevel(leftEarScore);
            const rightEarLevel = validated.rightEarLevel ?? this.getHearingLevel(rightEarScore);
            const test = await this.prisma.hearingTest.create({
                data: {
                    ...validated,
                    leftEarScore,
                    rightEarScore,
                    overallScore,
                    leftEarLevel,
                    rightEarLevel,
                    leftEarResults: validated.leftEarResults,
                    rightEarResults: validated.rightEarResults,
                },
            });
            // Send to Telegram
            try {
                const levelNames = {
                    normal: 'Normal',
                    mild: 'Yengil',
                    moderate: "O'rtacha",
                    severe: 'Og\'ir',
                    profound: 'Juda og\'ir',
                };
                const message = `
🩺 *Yangi Eshitish Testi Natijasi*

👤 *Ism:* ${test.name || 'Noma\'lum'}
📞 *Telefon:* ${test.phone || 'Noma\'lum'}
${test.email ? `📧 *Email:* ${test.email}\n` : ''}

🎧 *Qurilma:* ${test.deviceType === 'headphone' ? 'Headphone' : 'Speaker'}
${test.volumeLevel ? `🔊 *Ovoz balandligi:* ${Math.round(test.volumeLevel * 100)}%\n` : ''}

📊 *Natijalar:*
👂 *Chap quloq:* ${test.leftEarScore}% (${levelNames[test.leftEarLevel || 'normal']})
👂 *O'ng quloq:* ${test.rightEarScore}% (${levelNames[test.rightEarLevel || 'normal']})
📈 *Umumiy:* ${test.overallScore}%

📅 *Sana:* ${new Date(test.createdAt).toLocaleString('uz-UZ')}
      `.trim();
                await this.telegramService.sendLead({
                    name: test.name || 'Eshitish testi',
                    phone: test.phone || 'N/A',
                    email: test.email,
                    source: 'hearing_test',
                    message: message,
                });
            }
            catch (error) {
                console.error('Failed to send hearing test result to Telegram:', error);
            }
            return test;
        }
        async update(id, data) {
            return this.prisma.hearingTest.update({
                where: { id },
                data,
            });
        }
        async delete(id) {
            return this.prisma.hearingTest.delete({
                where: { id },
            });
        }
    };
    return HearingTestService = _classThis;
})();
exports.HearingTestService = HearingTestService;
//# sourceMappingURL=hearing-test.service.js.map