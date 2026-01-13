import React from 'react';
interface PageHeaderProps {
    locale: 'uz' | 'ru';
    breadcrumbs: Array<{
        label: string;
        href?: string;
    }>;
    title: string;
    description?: string;
    icon?: React.ReactNode;
}
export default function PageHeader({ locale, breadcrumbs, title, description, icon }: PageHeaderProps): React.JSX.Element;
export {};
//# sourceMappingURL=page-header.d.ts.map