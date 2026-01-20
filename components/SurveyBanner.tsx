'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import { Button } from '@/components/ui/button'

const SURVEY_URL = 'https://umfragenup.uni-potsdam.de/Bafoeg_chatbot/'
const BANNER_DISMISSED_KEY = 'survey_banner_dismissed'

interface SurveyBannerProps {
    messageCount: number
    threshold?: number
}

export function SurveyBanner({ messageCount, threshold = 3 }: SurveyBannerProps) {
    const { t } = useLanguage()
    const [isDismissed, setIsDismissed] = useState(true)

    useEffect(() => {
        // Check if banner was previously dismissed
        const dismissed = localStorage.getItem(BANNER_DISMISSED_KEY)

        // Show banner if not dismissed and threshold is met
        if (!dismissed && messageCount >= threshold) {
            setIsDismissed(false)
        }
    }, [messageCount, threshold])

    const handleDismiss = () => {
        setIsDismissed(true)
        localStorage.setItem(BANNER_DISMISSED_KEY, 'true')
    }

    if (isDismissed) return null

    return (
        <div className="px-4 pt-4 pb-2">
            <div className="animate-in slide-in-from-top duration-500">
                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-lg p-3 backdrop-blur-sm">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-1">
                            <span className="text-xl">📊</span>
                            <p className="text-sm text-foreground">
                                {t('surveyBannerText' as any)}
                                <a
                                    href={SURVEY_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary font-medium hover:underline inline-flex items-center gap-1 ml-1"
                                >
                                    {t('surveyBannerLink' as any)}
                                </a>
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0 hover:bg-primary/10"
                            onClick={handleDismiss}
                            aria-label="Dismiss"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
