import type { Metadata } from "next";
import { ImpressumContent } from '@/components/impressum-content';

export const metadata: Metadata = {
    title: "Impressum — BAföG Bot",
    description: "Impressum und rechtliche Informationen für den BAföG Bot",
};

export default function ImpressumPage() {
    return <ImpressumContent />;
}
