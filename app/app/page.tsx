'use client'
import { MessageSquarePlus } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'

export default function AppIndesPage() {
    // Note: We removed the server-side auth check here because layout/middleware handles protection usually,
    // or we accept it's a client page. If we need user info, we can get it from a provider or simple client fetch.
    // For this simple text update, we just need the translation.
    const { t } = useLanguage()

    return (
        <div className="flex h-full flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <div className="rounded-full bg-muted p-4 mb-4">
                <MessageSquarePlus className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold mb-2">{t('welcomeApp')}</h2>
            <p className="max-w-xs mx-auto mb-6">
                {t('selectChat')}
            </p>
        </div>
    )
}
