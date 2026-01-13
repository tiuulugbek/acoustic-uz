import type { Locale } from '@/lib/locale';
interface TestResultsProps {
    locale: Locale;
    result: {
        leftEarScore?: number | null;
        rightEarScore?: number | null;
        overallScore?: number | null;
        leftEarLevel?: string | null;
        rightEarLevel?: string | null;
    };
    onContact: () => void;
    onRestart: () => void;
}
export default function TestResults({ locale, result, onContact, onRestart }: TestResultsProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=test-results.d.ts.map