"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function resetPassword() {
    const email = process.argv[2];
    const newPassword = process.argv[3];
    if (!email || !newPassword) {
        console.error('❌ Usage: ts-node reset-password.ts <email> <new-password>');
        console.error('   Example: ts-node reset-password.ts admin@acoustic.uz Admin#12345');
        process.exit(1);
    }
    try {
        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            console.error(`❌ User with email "${email}" not found`);
            process.exit(1);
        }
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        // Update user password
        await prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
                mustChangePassword: false,
            },
        });
        console.log(`✅ Password reset successfully for user: ${email}`);
        console.log(`   New password: ${newPassword}`);
    }
    catch (error) {
        console.error('❌ Error resetting password:', error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
resetPassword();
//# sourceMappingURL=reset-password.js.map