'use client'

import { Settings2, Type, Languages, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useAccessibility } from '@/contexts/accessibility-context'
import { useLanguage } from '@/contexts/language-context'

export function AccessibilitySettings({ showEasyLanguage = true }: { showEasyLanguage?: boolean }) {
    const { fontSize, setFontSize, isEasyLanguage, setIsEasyLanguage } = useAccessibility()
    const { t } = useLanguage()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground" title={t('accessibilityTitle')}>
                    <Settings2 className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{t('appearance')}</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Font Size Section */}
                <div className="p-2">
                    <div className="flex items-center gap-2 mb-2">
                        <Type className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{t('textSize')}</span>
                    </div>
                    <div className="flex bg-muted rounded-md p-1 gap-1">
                        <Button
                            variant={fontSize === 'normal' ? 'default' : 'ghost'}
                            size="sm"
                            className="h-7 flex-1 text-xs"
                            onClick={() => setFontSize('normal')}
                        >
                            Aa
                        </Button>
                        <Button
                            variant={fontSize === 'large' ? 'default' : 'ghost'}
                            size="sm"
                            className="h-7 flex-1 text-sm"
                            onClick={() => setFontSize('large')}
                        >
                            Aa
                        </Button>
                        <Button
                            variant={fontSize === 'xl' ? 'default' : 'ghost'}
                            size="sm"
                            className="h-7 flex-1 text-base font-bold"
                            onClick={() => setFontSize('xl')}
                        >
                            Aa
                        </Button>
                    </div>
                </div>

                {showEasyLanguage && (
                    <>
                        <DropdownMenuSeparator />

                        {/* Language Mode Section */}
                        <div className="p-2">
                            <div className="flex items-center gap-2 mb-2">
                                <Languages className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">{t('languageMode')}</span>
                            </div>
                            <button
                                className="flex items-center justify-between w-full p-2 rounded-md hover:bg-accent text-sm"
                                onClick={() => setIsEasyLanguage(!isEasyLanguage)}
                            >
                                <span>{t('simpleLanguage')}</span>
                                {isEasyLanguage && <Check className="h-4 w-4 text-primary" />}
                            </button>
                            <p className="text-[10px] text-muted-foreground mt-1 px-2">
                                {t('simpleLanguageDesc')}
                            </p>
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
