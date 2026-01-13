'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type FontSize = 'normal' | 'large' | 'xl'

interface AccessibilityContextType {
    fontSize: FontSize
    setFontSize: (size: FontSize) => void
    isEasyLanguage: boolean
    setIsEasyLanguage: (isEasy: boolean) => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
    const [fontSize, setFontSize] = useState<FontSize>('normal')
    const [isEasyLanguage, setIsEasyLanguage] = useState(false)
    const [mounted, setMounted] = useState(false)

    // Helper to apply font size
    const applyFontSize = (size: FontSize) => {
        const root = document.documentElement
        switch (size) {
            case 'large':
                root.style.fontSize = '112.5%' // 18px
                break
            case 'xl':
                root.style.fontSize = '125%' // 20px
                break
            case 'normal':
            default:
                root.style.fontSize = '100%' // 16px
                break
        }
    }

    useEffect(() => {
        // Load from local storage
        const storedSize = localStorage.getItem('accessibility-font-size') as FontSize
        const storedEasy = localStorage.getItem('accessibility-easy-lang')

        if (storedSize) {
            setFontSize(storedSize)
            applyFontSize(storedSize)
        }

        if (storedEasy) {
            setIsEasyLanguage(storedEasy === 'true')
        }

        setMounted(true)
    }, [])

    const handleSetFontSize = (size: FontSize) => {
        setFontSize(size)
        applyFontSize(size)
        localStorage.setItem('accessibility-font-size', size)
    }

    const handleSetEasyLanguage = (isEasy: boolean) => {
        setIsEasyLanguage(isEasy)
        localStorage.setItem('accessibility-easy-lang', String(isEasy))
    }

    // Prepare context value
    const value = {
        fontSize,
        setFontSize: handleSetFontSize,
        isEasyLanguage,
        setIsEasyLanguage: handleSetEasyLanguage,
    }

    // Prevent hydration mismatch by not rendering until mounted if implementing this way, 
    // but since we modify the root html style in useEffect, we can render children immediately.
    // However, to avoid flash, we accept that initial render on server is 100%.

    return (
        <AccessibilityContext.Provider value={value}>
            {children}
        </AccessibilityContext.Provider>
    )
}

export function useAccessibility() {
    const context = useContext(AccessibilityContext)
    if (context === undefined) {
        throw new Error('useAccessibility must be used within a AccessibilityProvider')
    }
    return context
}
