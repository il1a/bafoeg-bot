'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/theme-toggle'
import { Loader2, Mail, EyeOff } from 'lucide-react'

import { LanguageToggle } from '@/components/language-toggle'
import { AccessibilitySettings } from '@/components/accessibility-settings'
import { useLanguage } from '@/contexts/language-context'
import { Footer } from '@/components/footer'

export default function LoginPage() {
    const { t } = useLanguage()
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        setSuccess(null)

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            })
            if (error) throw error
            setSuccess(t('successMagicLink'))
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'An error occurred'
            setError(message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-background pb-20">
            <div className="flex-1 flex items-center justify-center px-4 relative">
                <div className="absolute top-4 right-4 flex items-center gap-2">
                    <AccessibilitySettings showEasyLanguage={false} />
                    <LanguageToggle />
                    <ThemeToggle />
                </div>
                <div className="w-full max-w-md space-y-8 rounded-xl border bg-card p-10 shadow-sm">
                    <div className="flex flex-col items-center gap-2 text-center">
                        <div className="h-16 w-16 mb-2">
                            <Image src="/bot-avatar.svg" alt="BAföG Bot" width={64} height={64} priority />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">{t('welcomeTitle')}</h1>
                        <p className="text-sm text-muted-foreground">{t('magicLinkSubtitle')}</p>
                    </div>

                    <form onSubmit={handleMagicLink} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="email"
                                placeholder={t('emailPlaceholder')}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                required
                            />
                        </div>

                        {error && (
                            <div className="text-sm text-destructive font-medium text-center">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="text-sm text-green-600 font-medium text-center">
                                {success}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Mail className="mr-2 h-4 w-4" />
                            {t('sendMagicBtn')}
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">{t('or')}</span>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => router.push('/try')}
                        >
                            <EyeOff className="mr-2 h-4 w-4" />
                            {t('tryWithoutAccount')}
                        </Button>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    )
}
