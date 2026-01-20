'use client'

import { useState, useEffect } from 'react'
import { ExternalLink } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const SURVEY_URL = 'https://umfragenup.uni-potsdam.de/Bafoeg_chatbot/'
const MODAL_SHOWN_KEY = 'survey_modal_shown'

interface SurveyModalProps {
    messageCount: number
    threshold?: number
}

export function SurveyModal({ messageCount, threshold = 10 }: SurveyModalProps) {
    const { t } = useLanguage()
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        // Check if modal was already shown
        const alreadyShown = localStorage.getItem(MODAL_SHOWN_KEY)

        // Show modal only once when threshold is reached
        if (!alreadyShown && messageCount >= threshold) {
            // Small delay for better UX
            const timer = setTimeout(() => {
                setIsOpen(true)
                localStorage.setItem(MODAL_SHOWN_KEY, 'true')
            }, 1000)

            return () => clearTimeout(timer)
        }
    }, [messageCount, threshold])

    const handleTakeSurvey = () => {
        window.open(SURVEY_URL, '_blank', 'noopener,noreferrer')
        setIsOpen(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle className="text-xl">
                        {t('surveyModalTitle' as any)}
                    </DialogTitle>
                    <DialogDescription className="text-sm leading-relaxed pt-2">
                        {t('surveyModalText' as any)}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
                    <Button
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        className="sm:flex-1"
                    >
                        {t('surveyModalLater' as any)}
                    </Button>
                    <Button
                        onClick={handleTakeSurvey}
                        className="sm:flex-1 gap-2"
                    >
                        <ExternalLink className="h-4 w-4" />
                        {t('surveyModalButton' as any)}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
