"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BranchesPageContent;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const locale_1 = require("@/lib/locale");
const image_utils_1 = require("@/lib/image-utils");
const link_1 = __importDefault(require("next/link"));
const image_1 = __importDefault(require("next/image"));
const lucide_react_1 = require("lucide-react");
const branches_map_1 = __importDefault(require("@/components/branches-map"));
const branches_list_1 = __importDefault(require("@/components/branches-list"));
const page_header_1 = __importDefault(require("@/components/page-header"));
function BranchesPageContent({ initialBranches, initialPosts, initialLocale }) {
    const searchParams = (0, navigation_1.useSearchParams)();
    const [branches] = (0, react_1.useState)(initialBranches);
    const [posts] = (0, react_1.useState)(initialPosts);
    const [selectedRegion, setSelectedRegion] = (0, react_1.useState)(null);
    const [locale] = (0, react_1.useState)(initialLocale);
    const [branchesByRegion, setBranchesByRegion] = (0, react_1.useState)({});
    const [regionNames, setRegionNames] = (0, react_1.useState)({});
    // Check URL params on mount
    (0, react_1.useEffect)(() => {
        const regionParam = searchParams.get('region');
        if (regionParam) {
            setSelectedRegion(regionParam);
        }
    }, [searchParams]);
    const usefulArticles = posts?.slice(0, 5) || [];
    return (<main className="min-h-screen bg-background">
      <page_header_1.default locale={locale} breadcrumbs={[
            { label: locale === 'ru' ? 'Главная' : 'Bosh sahifa', href: '/' },
            { label: locale === 'ru' ? 'Наши адреса' : 'Bizning manzillarimiz' },
        ]} title={locale === 'ru' ? 'Acoustic — Филиалы центра слуха' : 'Acoustic — Eshitish markazi filiallari'} icon={<lucide_react_1.MapPin className="h-8 w-8 text-white"/>}/>

      {/* Main Content */}
      <section className="bg-muted/40 py-8">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            {/* Left Column - Map and Branches List */}
            <div className="space-y-8">
              {/* Map */}
              <div className="rounded-lg bg-white p-4 shadow-sm">
                <branches_map_1.default branches={branches} locale={locale} onRegionSelect={setSelectedRegion} selectedRegion={selectedRegion} onBranchesByRegionChange={setBranchesByRegion} onRegionNamesChange={setRegionNames}/>
              </div>
              
              {/* Branches List - Filtered by selected region */}
              <branches_list_1.default branches={branches} selectedRegion={selectedRegion} locale={locale} onClearFilter={() => setSelectedRegion(null)} branchesByRegion={branchesByRegion} regionNames={regionNames}/>
            </div>

            {/* Right Column - Useful Articles - Sticky Sidebar */}
            <aside className="lg:sticky lg:top-4 lg:self-start space-y-6">
              <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-foreground" suppressHydrationWarning>
                  {locale === 'ru' ? 'Полезные статьи' : 'Foydali maqolalar'}
                </h3>
                {usefulArticles.length > 0 ? (<ul className="space-y-4">
                    {usefulArticles.map((article) => {
                const title = (0, locale_1.getBilingualText)(article.title_uz, article.title_ru, locale);
                const imageUrl = (0, image_utils_1.normalizeImageUrl)(article.cover?.url);
                return (<li key={article.id}>
                          <link_1.default href={`/posts/${article.slug}`} className="group flex items-start gap-3 transition hover:opacity-80">
                            {imageUrl ? (<div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted/20">
                                <image_1.default src={imageUrl} alt={title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="64px"/>
                              </div>) : (<div className="w-16 h-16 flex-shrink-0 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                                <lucide_react_1.MapPin className="h-6 w-6 text-brand-primary"/>
                              </div>)}
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium text-foreground group-hover:text-brand-primary line-clamp-2 transition-colors" suppressHydrationWarning>
                                {title}
                              </span>
                            </div>
                          </link_1.default>
                        </li>);
            })}
                  </ul>) : (<p className="text-sm text-muted-foreground" suppressHydrationWarning>
                    {locale === 'ru' ? 'Статьи скоро будут добавлены.' : 'Maqolalar tez orada qo\'shiladi.'}
                  </p>)}
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>);
}
//# sourceMappingURL=page-content.js.map