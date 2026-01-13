import type { Locale } from '@/lib/locale';
interface ContactFormProps {
    locale: Locale;
    onSubmit: (data: {
        name?: string;
        phone?: string;
        email?: string;
    }) => void;
    onBack: () => void;
    isSubmitting: boolean;
}
export default function ContactForm({ locale, onSubmit, onBack, isSubmitting }: ContactFormProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=contact-form.d.ts.map