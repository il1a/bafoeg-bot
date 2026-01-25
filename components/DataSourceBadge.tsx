'use client'

import { Database, Scale } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import { cn } from '@/lib/utils'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'

interface DataSourceBadgeProps {
    variant?: 'full' | 'compact'
    className?: string
}

/**
 * Displays the data source information for transparency.
 * - "full" variant: Shows full text (for welcome screen)
 * - "compact" variant: Shows icon with tooltip (for header)
 */
export function DataSourceBadge({ variant = 'full', className }: DataSourceBadgeProps) {
    const { t } = useLanguage()

    const bafoegReform = t('dataSourceBafoeg' as any) || '29. BAföG-Reform (Juli 2024)'
    const minijobInfo = t('dataSourceMinijob' as any) || 'Minijob-Grenze 2025: 556 €'
    const dataStandLabel = t('dataStand' as any) || 'Datenstand'

    if (variant === 'compact') {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            className={cn(
                                "flex items-center gap-1.5 px-2 py-1 rounded-full",
                                "bg-muted/50 hover:bg-muted transition-colors",
                                "text-[10px] text-muted-foreground hover:text-foreground",
                                className
                            )}
                        >
                            <Database className="h-3 w-3" />
                            <span className="hidden sm:inline">{dataStandLabel}</span>
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                        <div className="text-xs space-y-1">
                            <div className="flex items-center gap-2">
                                <Scale className="h-3 w-3 text-primary" />
                                <span>{bafoegReform}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground ml-5">{minijobInfo}</span>
                            </div>
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    }

    // Full variant for welcome screen
    return (
        <div className={cn(
            "flex items-center justify-center gap-2 mt-4 px-3 py-2 rounded-lg",
            "bg-muted/30 border border-muted-foreground/10",
            className
        )}>
            <Database className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <div className="text-[11px] text-muted-foreground text-center">
                <span className="font-medium">{dataStandLabel}:</span>{' '}
                <span>{bafoegReform}</span>
                <span className="mx-1.5 opacity-50">|</span>
                <span>{minijobInfo}</span>
            </div>
        </div>
    )
}
