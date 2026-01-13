"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BranchesPage;
const react_1 = require("react");
const locale_server_1 = require("@/lib/locale-server");
const api_server_1 = require("@/lib/api-server");
const page_content_1 = __importDefault(require("./page-content"));
async function BranchesPage() {
    const locale = (0, locale_server_1.detectLocale)();
    // Fetch data on server
    const [branches, posts] = await Promise.all([
        (0, api_server_1.getBranches)(locale),
        (0, api_server_1.getPosts)(locale, true, undefined, 'article'),
    ]);
    return (<react_1.Suspense fallback={<main className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Yuklanmoqda...</p>
          </div>
        </div>
      </main>}>
      <page_content_1.default initialBranches={branches || []} initialPosts={posts || []} initialLocale={locale}/>
    </react_1.Suspense>);
}
//# sourceMappingURL=page.js.map