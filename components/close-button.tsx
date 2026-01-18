'use client'

import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CloseButton() {
    const router = useRouter()

    return (
        <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 right-4 z-50 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/80 border border-border"
            onClick={() => router.back()}
            aria-label="Close"
        >
            <X className="h-5 w-5" />
        </Button>
    )
}
