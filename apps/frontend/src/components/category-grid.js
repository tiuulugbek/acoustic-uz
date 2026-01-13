"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CategoryGrid;
const image_1 = __importDefault(require("next/image"));
const link_1 = __importDefault(require("next/link"));
const image_utils_1 = require("@/lib/image-utils");
const locale_1 = require("@/lib/locale");
function CategoryGrid({ categories, locale }) {
    if (!categories || categories.length === 0) {
        return null;
    }
    return (<div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-12">
      {categories.map((category) => {
            const name = (0, locale_1.getBilingualText)(category.name_uz, category.name_ru, locale);
            const description = (0, locale_1.getBilingualText)(category.description_uz, category.description_ru, locale);
            const imageUrl = category.image?.url ? (0, image_utils_1.normalizeImageUrl)(category.image.url) : null;
            return (<link_1.default key={category.id} href={`/posts?category=${category.slug}`} className="group flex flex-col overflow-hidden rounded-lg border border-border bg-white shadow-sm transition-all hover:shadow-md hover:border-brand-primary/50">
            {imageUrl && (<div className="relative aspect-video w-full overflow-hidden bg-muted">
                <image_1.default src={imageUrl} alt={name} fill className="object-cover transition-transform group-hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"/>
              </div>)}
            <div className="flex flex-1 flex-col p-6">
              <h3 className="mb-2 text-xl font-semibold text-foreground group-hover:text-brand-primary transition-colors">
                {name}
              </h3>
              {description && (<p className="text-sm text-muted-foreground line-clamp-3">
                  {description}
                </p>)}
            </div>
          </link_1.default>);
        })}
    </div>);
}
//# sourceMappingURL=category-grid.js.map