'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/theme-toggle'
import { Loader2, ArrowLeft, Mail } from 'lucide-react'

type AuthMode = 'signin' | 'signup' | 'forgot' | 'magic-link'

import { LanguageToggle } from '@/components/language-toggle'
import { useLanguage } from '@/contexts/language-context'

export default function LoginPage() {
    const { t } = useLanguage()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [mode, setMode] = useState<AuthMode>('signin')
    const router = useRouter()
    const supabase = createClient()

    const handleAuth = async (e: React.FormEvent) => {
        // ... (auth logic remains same, but strings could be translated if we added dynamic error messages)
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        setSuccess(null)

        try {
            if (mode === 'magic-link') {
                const { error } = await supabase.auth.signInWithOtp({
                    email,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                })
                if (error) throw error
                setSuccess(t('successMagicLink'))
            } else if (mode === 'forgot') {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
                })
                if (error) throw error
                setSuccess(t('successResetLink'))
            } else if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                })
                if (error) throw error
                setSuccess(t('successSignup'))
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
                router.push('/app')
                router.refresh()
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'An error occurred'
            setError(message)
        } finally {
            setIsLoading(false)
        }
    }

    const switchMode = (newMode: AuthMode) => {
        setMode(newMode)
        setError(null)
        setSuccess(null)
    }

    const getTitle = () => {
        switch (mode) {
            case 'signin': return t('welcomeTitle')
            case 'signup': return t('joinTitle')
            case 'forgot': return t('resetTitle')
            case 'magic-link': return t('magicLinkTitle')
        }
    }

    const getSubtitle = () => {
        switch (mode) {
            case 'signin': return t('signinSubtitle')
            case 'signup': return t('signupSubtitle')
            case 'forgot': return t('forgotSubtitle')
            case 'magic-link': return t('magicLinkSubtitle')
        }
    }

    const getButtonText = () => {
        switch (mode) {
            case 'signin': return t('signinBtn')
            case 'signup': return t('signupBtn')
            case 'forgot': return t('sendResetBtn')
            case 'magic-link': return t('sendMagicBtn')
        }
    }

    const showPasswordField = mode === 'signin' || mode === 'signup'
    const showBackButton = mode === 'forgot' || mode === 'magic-link'

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 relative">
            <div className="absolute top-4 right-4 flex items-center gap-2">
                <LanguageToggle />
                <ThemeToggle />
            </div>
            <div className="w-full max-w-md space-y-8 rounded-xl border bg-card p-10 shadow-sm">
                <div className="flex flex-col items-center gap-2 text-center">
                    <div className="h-16 w-16 mb-2">
                        <Image src="/bot-avatar.svg" alt="BAföG Bot" width={64} height={64} priority />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">{getTitle()}</h1>
                    <p className="text-sm text-muted-foreground">{getSubtitle()}</p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
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
                    {showPasswordField && (
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder={t('passwordPlaceholder')}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                                required
                                minLength={6}
                            />
                        </div>
                    )}

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
                        {getButtonText()}
                    </Button>

                    {mode === 'signin' && (
                        <>
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-card px-2 text-muted-foreground">Or</span>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => switchMode('magic-link')}
                            >
                                <Mail className="mr-2 h-4 w-4" />
                                {t('magicLinkOption')}
                            </Button>
                            <button
                                type="button"
                                className="w-full text-sm text-muted-foreground hover:text-primary hover:underline"
                                onClick={() => switchMode('forgot')}
                            >
                                {t('forgotPassword')}
                            </button>
                        </>
                    )}

                    {showBackButton && (
                        <button
                            type="button"
                            className="w-full text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-1"
                            onClick={() => switchMode('signin')}
                        >
                            <ArrowLeft className="h-3 w-3" />
                            {t('backToSignIn')}
                        </button>
                    )}

                    {mode !== 'forgot' && mode !== 'magic-link' && (
                        <div className="text-center text-sm">
                            <button
                                type="button"
                                className="text-primary hover:underline"
                                onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
                            >
                                {mode === 'signin'
                                    ? t('noAccount')
                                    : t('hasAccount')}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    )
}
