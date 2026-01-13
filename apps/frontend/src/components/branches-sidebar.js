"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BranchesSidebar;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const branches_map_sidebar_1 = __importDefault(require("./branches-map-sidebar"));
function BranchesSidebar({ locale, branches: initialBranches }) {
    const router = (0, navigation_1.useRouter)();
    const [branchesByRegion, setBranchesByRegion] = (0, react_1.useState)({});
    const [regionNames, setRegionNames] = (0, react_1.useState)({});
    const handleRegionSelect = (regionCode) => {
        if (regionCode) {
            // Navigate to /branches page with region filter
            router.push(`/branches?region=${regionCode}`);
        }
    };
    return (<div className="rounded-lg border border-border bg-card p-6">
      {/* Map */}
      <div>
        <branches_map_sidebar_1.default branches={initialBranches} locale={locale} onRegionSelect={handleRegionSelect} selectedRegion={null} onBranchesByRegionChange={setBranchesByRegion} onRegionNamesChange={setRegionNames}/>
      </div>
    </div>);
}
//# sourceMappingURL=branches-sidebar.js.map