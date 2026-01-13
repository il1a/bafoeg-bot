'use client'

import { useLanguage } from '@/contexts/language-context'
import { Button } from '@/components/ui/button'

export function LanguageToggle() {
    const { language, setLanguage } = useLanguage()

    return (
        <Button
            variant="ghost"
            size="sm"
            className="w-9 px-0 font-bold"
            onClick={() => setLanguage(language === 'en' ? 'de' : 'en')}
            title={language === 'en' ? "Switch to German" : "Switch to English"}
        >
            {language.toUpperCase()}
        </Button>
    )
}
