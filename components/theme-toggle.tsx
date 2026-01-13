'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <Button variant="ghost" size="icon" className="h-9 w-9" disabled>
                <Sun className="h-4 w-4" />
            </Button>
        )
    }

    const cycleTheme = () => {
        if (theme === 'light') setTheme('dark')
        else if (theme === 'dark') setTheme('system')
        else setTheme('light')
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={cycleTheme}
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            title={`Current: ${theme}. Click to change.`}
        >
            <Sun className={cn(
                "h-4 w-4 absolute transition-all duration-200",
                theme === 'light' ? "opacity-100 scale-100" : "opacity-0 scale-75"
            )} />
            <Moon className={cn(
                "h-4 w-4 absolute transition-all duration-200",
                theme === 'dark' ? "opacity-100 scale-100" : "opacity-0 scale-75"
            )} />
            <Monitor className={cn(
                "h-4 w-4 absolute transition-all duration-200",
                theme === 'system' ? "opacity-100 scale-100" : "opacity-0 scale-75"
            )} />
        </Button>
    )
}
