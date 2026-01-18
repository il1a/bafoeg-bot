import type { Metadata } from "next";
import { PrivacyContent } from '@/components/privacy-content';

export const metadata: Metadata = {
    title: "Datenschutzerklärung — BAföG Bot",
    description: "Datenschutzerklärung für den BAföG Bot",
};

export default function DatenschutzPage() {
    return <PrivacyContent />;
}
