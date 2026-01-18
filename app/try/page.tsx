import { IncognitoChatWindow } from '@/components/IncognitoChatWindow'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import { AccessibilitySettings } from '@/components/accessibility-settings'
import Link from 'next/link'
import Image from 'next/image'

export default function TryPage() {
    return (
        <div className="flex flex-col h-screen">
            {/* Header */}
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex h-14 items-center justify-between px-4 max-w-5xl mx-auto">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/bot-avatar.svg" alt="BAföG Bot" width={32} height={32} />
                        <span className="font-semibold">BAföG Bot</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <AccessibilitySettings />
                        <LanguageToggle />
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            {/* Chat */}
            <main className="flex-1 min-h-0">
                <IncognitoChatWindow />
            </main>
        </div>
    )
}
