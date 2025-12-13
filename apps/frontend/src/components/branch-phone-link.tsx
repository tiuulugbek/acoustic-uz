'use client';

import { Phone } from 'lucide-react';
import { trackPhoneClick } from '@/lib/analytics';

interface BranchPhoneLinkProps {
  phone: string;
  phones?: string[];
}

export default function BranchPhoneLink({ phone, phones }: BranchPhoneLinkProps) {
  const handlePhoneClick = (e: React.MouseEvent, phoneNum: string) => {
    e.preventDefault();
    e.stopPropagation();
    trackPhoneClick(phoneNum, window.location.pathname);
    window.location.href = `tel:${phoneNum}`;
  };

  return (
    <div className="flex items-start gap-2 text-sm text-muted-foreground">
      <Phone className="h-4 w-4 mt-0.5 flex-shrink-0 text-brand-primary" />
      <div className="flex flex-col">
        <button
          type="button"
          onClick={(e) => handlePhoneClick(e, phone)}
          className="text-left hover:text-brand-primary transition-colors"
        >
          {phone}
        </button>
        {phones && phones.length > 0 && (
          <div className="mt-1 space-y-0.5">
            {phones.map((phoneNum, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => handlePhoneClick(e, phoneNum)}
                className="block text-left hover:text-brand-primary transition-colors"
              >
                {phoneNum}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

