'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/language-context'
import { FileText, ShieldCheck, Languages, Zap, UserX, Info } from 'lucide-react'

export function OnboardingModal() {
    const [isOpen, setIsOpen] = useState(false)
    const { t, language } = useLanguage()

    useEffect(() => {
        // Check local storage on mount
        const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding')
        if (!hasSeenOnboarding) {
            setIsOpen(true)
        }
    }, [])

    const handleClose = () => {
        setIsOpen(false)
        localStorage.setItem('hasSeenOnboarding', 'true')
    }

    // Manual Re-trigger for testing (optional, not UI exposed yet)
    // window.resetOnboarding = () => localStorage.removeItem('hasSeenOnboarding')

    // Content based on language
    const isDe = language === 'de'

    const title = isDe ? "Neu hier? 👋" : "New here? 👋"
    const subtitle = isDe
        ? "Willkommen beim BAföG Bot! Hier sind einige Features, die du kennen solltest:"
        : "Welcome to BAföG Bot! Here are some features you should know:"

    const features = [
        {
            icon: <UserX className="h-5 w-5 text-blue-500" />,
            title: isDe ? "100% Anonym" : "100% Anonymous",
            desc: isDe ? "Nutze den Bot ohne Konto. Keine Datenspeicherung." : "Use without an account. No data retention."
        },
        {
            icon: <FileText className="h-5 w-5 text-orange-500" />,
            title: isDe ? "Dokumentenhilfe" : "Document Helper",
            desc: isDe ? "Lade PDFs/Screenshots hoch – einzeln, für beste Hilfe." : "Upload PDFs or screenshots – one at a time for best results."
        },
        {
            icon: <ShieldCheck className="h-5 w-5 text-green-500" />,
            title: isDe ? "Verifizierbar" : "Verifiable",
            desc: isDe ? "Jede Antwort enthält Links zu offiziellen Quellen." : "Every answer includes links to official sources."
        },
        {
            icon: <Zap className="h-5 w-5 text-yellow-500" />,
            title: isDe ? "Magic Link" : "Magic Link",
            desc: isDe ? "Melde dich optional an, um Chats zu speichern." : "Optionally sign in to save and manage chats."
        },
        {
            icon: <Languages className="h-5 w-5 text-purple-500" />,
            title: isDe ? "Mehrsprachig" : "Multilingual",
            desc: isDe ? "Chatte in jeder Sprache (DE, EN, FR, TR, uvm.)." : "Chat in any language (DE, EN, FR, TR, etc.)."
        }
    ]

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl flex items-center gap-2">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-base pt-2">
                        {subtitle}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-2">
                    {features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="mt-1 shrink-0 bg-muted p-1.5 rounded-full">
                                {feature.icon}
                            </div>
                            <div>
                                <h4 className="font-medium text-sm text-foreground">{feature.title}</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <DialogFooter className="sm:justify-between gap-2">
                    <p className="text-[10px] text-muted-foreground text-center sm:text-left pt-2">
                        {isDe ? "Universitäts-Projekt • Keine Rechtsberatung" : "University Project • No Legal Advice"}
                    </p>
                    <Button onClick={handleClose} className="w-full sm:w-auto">
                        {isDe ? "Verstanden, los geht's!" : "Got it, let's go!"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
