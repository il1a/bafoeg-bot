'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { translations, TranslationKey, Language } from '@/lib/translations'

interface LanguageContextType {
    language: Language
    setLanguage: (lang: Language) => void
    t: (key: TranslationKey) => any
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    // Default to English initially to match server
    const [language, setLanguageState] = useState<Language>('en')
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        // Check cookie on mount
        const match = document.cookie.match(new RegExp('(^| )NEXT_LOCALE=([^;]+)'))
        if (match && (match[2] === 'en' || match[2] === 'de')) {
            setLanguageState(match[2] as Language)
        }
        setIsLoaded(true)
    }, [])

    const setLanguage = (lang: Language) => {
        setLanguageState(lang)
        document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=31536000` // 1 year
    }

    const t = (key: TranslationKey) => {
        return translations[language][key]
    }

    // Optional: Prevent hydration mismatch if needed, or just accept English default
    // For "slick" feel, we might want to avoid flash, but without detailed server setup
    // matching SSR is hard. We'll simply proceed. if isLoaded is vital we can use it.

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}
