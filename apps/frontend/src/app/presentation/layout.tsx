'use client';

import { ReactNode, useEffect } from 'react';

export default function PresentationLayout({
  children,
}: {
  children: ReactNode;
}) {
  useEffect(() => {
    // Hide header and footer for presentation page
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');
    const telegramButton = document.querySelector('[class*="TelegramButton"]');
    
    if (header) header.style.display = 'none';
    if (footer) footer.style.display = 'none';
    if (telegramButton) (telegramButton as HTMLElement).style.display = 'none';
    
    // Also hide via CSS class
    document.body.classList.add('presentation-mode');
    
    return () => {
      // Restore on unmount
      if (header) header.style.display = '';
      if (footer) footer.style.display = '';
      if (telegramButton) (telegramButton as HTMLElement).style.display = '';
      document.body.classList.remove('presentation-mode');
    };
  }, []);

  return (
    <div className="presentation-layout min-h-screen">
      <style jsx global>{`
        body.presentation-mode header,
        body.presentation-mode footer,
        body.presentation-mode [class*="TelegramButton"] {
          display: none !important;
        }
        body.presentation-mode main {
          padding: 0 !important;
          margin: 0 !important;
        }
      `}</style>
      {children}
    </div>
  );
}

