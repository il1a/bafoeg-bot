import { AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AuthCodeErrorPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-md space-y-6 rounded-xl border bg-card p-10 shadow-sm text-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 text-destructive bg-destructive/10 rounded-full flex items-center justify-center">
                        <AlertCircle className="h-6 w-6" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Authentication Error</h1>
                    <p className="text-sm text-muted-foreground">
                        The authentication link may have expired or is invalid. Please try again.
                    </p>
                </div>
                <Link href="/login">
                    <Button className="w-full">Return to Login</Button>
                </Link>
            </div>
        </div>
    )
}
