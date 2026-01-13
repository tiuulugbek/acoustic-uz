"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BranchPhoneLink;
const lucide_react_1 = require("lucide-react");
function BranchPhoneLink({ phone, phones }) {
    const handlePhoneClick = (e, phoneNum) => {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = `tel:${phoneNum}`;
    };
    return (<div className="flex items-start gap-2 text-sm text-muted-foreground">
      <lucide_react_1.Phone className="h-4 w-4 mt-0.5 flex-shrink-0 text-brand-primary"/>
      <div className="flex flex-col">
        <button type="button" onClick={(e) => handlePhoneClick(e, phone)} className="text-left hover:text-brand-primary transition-colors">
          {phone}
        </button>
        {phones && phones.length > 0 && (<div className="mt-1 space-y-0.5">
            {phones.map((phoneNum, idx) => (<button key={idx} type="button" onClick={(e) => handlePhoneClick(e, phoneNum)} className="block text-left hover:text-brand-primary transition-colors">
                {phoneNum}
              </button>))}
          </div>)}
      </div>
    </div>);
}
//# sourceMappingURL=branch-phone-link.js.map