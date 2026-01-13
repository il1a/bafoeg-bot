'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/theme-toggle'
import { Loader2, KeyRound, ArrowLeft, Mail } from 'lucide-react'

type AuthMode = 'signin' | 'signup' | 'forgot' | 'magic-link'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [mode, setMode] = useState<AuthMode>('signin')
    const router = useRouter()
    const supabase = createClient()

    const handleAuth = async (e: React.FormEvent) => {
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
                setSuccess('Check your email for a magic sign-in link!')
            } else if (mode === 'forgot') {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
                })
                if (error) throw error
                setSuccess('Check your email for a password reset link.')
            } else if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                })
                if (error) throw error
                setSuccess('Check your email to confirm your account.')
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
            case 'signin': return 'Welcome Back'
            case 'signup': return 'Create an Account'
            case 'forgot': return 'Reset Password'
            case 'magic-link': return 'Sign in with Magic Link'
        }
    }

    const getSubtitle = () => {
        switch (mode) {
            case 'signin': return 'Enter your credentials to access the chat engine.'
            case 'signup': return 'Enter your details to create an account.'
            case 'forgot': return 'Enter your email and we\'ll send you a reset link.'
            case 'magic-link': return 'We\'ll send you a link to sign in instantly.'
        }
    }

    const getButtonText = () => {
        switch (mode) {
            case 'signin': return 'Sign In'
            case 'signup': return 'Sign Up'
            case 'forgot': return 'Send Reset Link'
            case 'magic-link': return 'Send Magic Link'
        }
    }

    const showPasswordField = mode === 'signin' || mode === 'signup'
    const showBackButton = mode === 'forgot' || mode === 'magic-link'

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 relative">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>
            <div className="w-full max-w-md space-y-8 rounded-xl border bg-card p-10 shadow-sm">
                <div className="flex flex-col items-center gap-2 text-center">
                    <div className="h-10 w-10 text-primary bg-primary/10 rounded-full flex items-center justify-center mb-2">
                        {mode === 'magic-link' ? <Mail className="h-5 w-5" /> : <KeyRound className="h-5 w-5" />}
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">{getTitle()}</h1>
                    <p className="text-sm text-muted-foreground">{getSubtitle()}</p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    <div className="space-y-2">
                        <Input
                            type="email"
                            placeholder="name@example.com"
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
                                placeholder="Password"
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
                                Sign in with Magic Link
                            </Button>
                            <button
                                type="button"
                                className="w-full text-sm text-muted-foreground hover:text-primary hover:underline"
                                onClick={() => switchMode('forgot')}
                            >
                                Forgot your password?
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
                            Back to Sign In
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
                                    ? "Don't have an account? Sign Up"
                                    : "Already have an account? Sign In"}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    )
}
