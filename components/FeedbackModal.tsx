'use client'

import { ExternalLink, Mail, MessageSquare } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface FeedbackModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const SURVEY_URL = 'https://umfragenup.uni-potsdam.de/Bafoeg_chatbot/'
const EMAIL = 'feedback@bafoeg.ilia.work'

export function FeedbackModal({ open, onOpenChange }: FeedbackModalProps) {
    const { t } = useLanguage()

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-xl flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        {t('feedbackModalTitle' as any)}
                    </DialogTitle>
                    <DialogDescription>
                        {t('feedbackModalDesc' as any)}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                    {/* Survey Section */}
                    <div className="space-y-3 p-4 rounded-lg border bg-card">
                        <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <ExternalLink className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 space-y-2">
                                <h4 className="font-semibold text-sm">
                                    {t('takeSurvey' as any)}
                                </h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {t('surveyDescription' as any)}
                                </p>
                                <Button
                                    asChild
                                    className="w-full gap-2"
                                    size="sm"
                                >
                                    <a
                                        href={SURVEY_URL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        {t('takeSurvey' as any)}
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Email Section */}
                    <div className="space-y-3 p-4 rounded-lg border bg-muted/30">
                        <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                                <Mail className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 space-y-2">
                                <h4 className="font-semibold text-sm">
                                    {t('emailFeedback' as any)}
                                </h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {t('emailDescription' as any)}
                                </p>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="w-full gap-2"
                                    size="sm"
                                >
                                    <a href={`mailto:${EMAIL}`}>
                                        <Mail className="h-4 w-4" />
                                        {EMAIL}
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        size="sm"
                    >
                        {t('closeModal' as any)}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
