import { motion } from 'framer-motion'
import { ArrowRight, GraduationCap, Globe, Wallet, FileText } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import { cn } from '@/lib/utils'

interface ExamplePromptsProps {
    onSelect: (text: string) => void
    className?: string
}

export function ExamplePrompts({ onSelect, className }: ExamplePromptsProps) {
    const { t } = useLanguage()

    // We cast to any to escape strict typing if the key doesn't exist yet on the type
    // In a real scenario we'd update the type definition, but this works given our setup
    const prompts = (t('prompts' as any) as any)

    if (!prompts) return null

    const items = [
        {
            key: 'eligibility',
            icon: GraduationCap,
            label: prompts.eligibility.label,
            query: prompts.eligibility.query,
            delay: 0.1
        },
        {
            key: 'application',
            icon: FileText,
            label: prompts.application.label,
            query: prompts.application.query,
            delay: 0.2
        },
        {
            key: 'income',
            icon: Wallet,
            label: prompts.income.label,
            query: prompts.income.query,
            delay: 0.3
        },
        {
            key: 'abroad',
            icon: Globe,
            label: prompts.abroad.label,
            query: prompts.abroad.query,
            delay: 0.4
        }
    ]

    return (
        <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mx-auto mt-8 px-4", className)}>
            {items.map((item) => (
                <motion.button
                    key={item.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: item.delay, duration: 0.3 }}
                    onClick={() => onSelect(item.query)}
                    className="group relative flex items-center gap-3 p-4 text-left rounded-xl border border-muted/40 bg-background/50 hover:bg-muted/50 transition-all duration-200 hover:border-muted-foreground/20 backdrop-blur-sm"
                >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                        <item.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-foreground/90 group-hover:text-foreground">
                            {item.label}
                        </span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary/50 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                </motion.button>
            ))}
        </div>
    )
}
