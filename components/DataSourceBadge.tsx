'use client'

import { Database, Scale } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import { cn } from '@/lib/utils'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { Button } from '@/components/ui/button'

interface DataSourceBadgeProps {
    variant?: 'full' | 'compact'
    className?: string
    forceLabelVisible?: boolean
}

/**
 * Displays the data source information for transparency.
 * - "full" variant: Shows full text (for welcome screen)
 * - "compact" variant: Shows icon with tooltip (for header)
 */
export function DataSourceBadge({ variant = 'full', className, forceLabelVisible = false }: DataSourceBadgeProps) {
    const { t } = useLanguage()

    const bafoegReform = t('dataSourceBafoeg' as any) || '29. BAföG-Reform (Juli 2024)'
    const minijobInfo = t('dataSourceMinijob' as any) || 'Minijob-Grenze 2026: 603 €'
    const dataStandLabel = t('dataStand' as any) || 'Datenstand'

    if (variant === 'compact') {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "flex items-center gap-2 font-normal text-muted-foreground hover:text-foreground transition-colors h-auto p-0 focus-visible:ring-0 focus-visible:ring-offset-0 shrink-0",
                            className
                        )}
                    >
                        <Database className="h-4 w-4" />
                        <span className={cn(
                            "hidden sm:inline",
                            forceLabelVisible && "inline"
                        )}>{dataStandLabel}</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom" className="max-w-xs p-3">
                    <div className="text-xs space-y-2">
                        <div className="flex items-center gap-2">
                            <Scale className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span className="font-medium">{bafoegReform}</span>
                        </div>
                        <div className="flex items-center gap-2 pl-5.5 text-muted-foreground">
                            <span>{minijobInfo}</span>
                        </div>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }

    // Full variant for welcome screen
    return (
        <div className={cn(
            "flex items-center justify-center gap-2 mt-4 px-3 py-2 rounded-lg",
            "bg-muted/40 border border-border/50 shadow-sm",
            className
        )}>
            <Database className="h-3.5 w-3.5 text-primary shrink-0" />
            <div className="text-[11px] text-foreground/90 text-center font-medium">
                <span className="text-muted-foreground font-normal">{dataStandLabel}:</span>{' '}
                <span>{bafoegReform}</span>
                <span className="mx-2 text-muted-foreground/40">|</span>
                <span>{minijobInfo}</span>
            </div>
        </div>
    )
}
