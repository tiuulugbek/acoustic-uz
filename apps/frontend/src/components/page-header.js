"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PageHeader;
const react_1 = __importDefault(require("react"));
const link_1 = __importDefault(require("next/link"));
function PageHeader({ locale, breadcrumbs, title, description, icon }) {
    return (<>
      {/* Breadcrumbs */}
      <section className="bg-[hsl(var(--secondary))]">
        <div className="mx-auto max-w-6xl px-4 py-2 sm:py-3 text-xs font-semibold uppercase tracking-wide text-white sm:px-6">
          <div className="flex flex-wrap items-center gap-x-2">
            {breadcrumbs.map((crumb, index) => (<span key={index} className="flex items-center">
                {index > 0 && <span className="mx-1 sm:mx-2">›</span>}
                {crumb.href ? (<link_1.default href={crumb.href} className="hover:text-white/80 text-white/70 break-words" suppressHydrationWarning>
                    {crumb.label}
                  </link_1.default>) : (<span className="text-white break-words" suppressHydrationWarning>{crumb.label}</span>)}
              </span>))}
          </div>
        </div>
      </section>
      
    </>);
}
//# sourceMappingURL=page-header.js.map