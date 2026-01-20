'use client'

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { Send, StopCircle, Sparkles, Loader2, LogIn, UserPlus, Paperclip, FileText, X, Info } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import MarkdownRenderer from '@/components/markdown/MarkdownRenderer'
import { useLanguage } from '@/contexts/language-context'
import { useAccessibility } from '@/contexts/accessibility-context'
import Link from 'next/link'
import { extractPdfText, isPdf } from '@/utils/pdf-extractor'
import { SurveyBanner } from '@/components/SurveyBanner'
import { SurveyModal } from '@/components/SurveyModal'

// Ephemeral message type (no DB schema dependency)
interface EphemeralMessage {
    id: string
    role: 'user' | 'assistant'
    content: string
    status: 'complete' | 'streaming' | 'error'
    created_at: string
    attachment?: { name: string; mimeType: string }
}

// File attachment for document uploads
interface FileAttachment {
    name: string
    mimeType: string
    base64Data: string
    extractedText?: string
    textExtractionSuccess?: boolean
}

const SESSION_STORAGE_KEY = 'incognito_chat_messages'
const SESSION_ID_KEY = 'incognito_session_id'
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf']

// Animated thinking indicator
function ThinkingIndicator() {
    const { t } = useLanguage()
    const [dotCount, setDotCount] = useState(0)
    const [phase, setPhase] = useState(0)

    const phases = (t('phases' as any) as any) || ['Thinking', 'Searching', 'Processing']
    const currentPhase = Array.isArray(phases) ? phases[phase] : phases

    useEffect(() => {
        const dotInterval = setInterval(() => {
            setDotCount(prev => (prev + 1) % 4)
        }, 400)

        const phaseInterval = setInterval(() => {
            if (Array.isArray(phases)) {
                setPhase(prev => (prev + 1) % phases.length)
            }
        }, 2500)

        return () => {
            clearInterval(dotInterval)
            clearInterval(phaseInterval)
        }
    }, [phases])

    return (
        <div className="flex items-center gap-3 text-muted-foreground">
            <div className="relative">
                <Sparkles className="h-4 w-4 animate-pulse text-primary" />
            </div>
            <span className="text-sm">
                {currentPhase}{'.'.repeat(dotCount)}
            </span>
        </div>
    )
}

// Helper to clean model output (same as useChatStream.ts)
function cleanModelOutput(rawOutput: string): string {
    if (!rawOutput) return ''
    let cleanedOutput = rawOutput

    const functionalMarkers = [
        /answer\.assistantfinal\s*(?:\*\*Antwort\*\*)?/i,
        /answer\.assistantfinal\s*(?:\*\*Answer\*\*)?/i,
        /assistantfinal\s*(?:\*\*Antwort\*\*)?/i,
        /assistantfinal\s*(?:\*\*Answer\*\*)?/i,
    ]

    for (const marker of functionalMarkers) {
        const matches = [...cleanedOutput.matchAll(new RegExp(marker, 'gi'))]
        if (matches.length > 0) {
            const lastMatch = matches[matches.length - 1]
            if (lastMatch.index !== undefined) {
                return cleanedOutput.substring(lastMatch.index + lastMatch[0].length).trim()
            }
        }
    }

    const standardMarkers = [
        /\*\*Antwort\*\*[:]?/i,
        /\*\*Answer\*\*[:]?/i,
        /^\s*Answer:/im,
        /^\s*Antwort:/im
    ]

    for (const marker of standardMarkers) {
        const match = cleanedOutput.match(marker)
        if (match && match.index !== undefined) {
            const potentialStart = cleanedOutput.substring(match.index)
            if (potentialStart.match(/^\s*Answer section:/i)) {
                continue
            }
            return potentialStart
        }
    }

    if (cleanedOutput.toLowerCase().startsWith('analysis')) {
        const answerStart = cleanedOutput.search(/\*\*Answer\*\*|\*\*Antwort\*\*|^Answer:|^Antwort:/im)
        if (answerStart > 0) {
            return cleanedOutput.substring(answerStart)
        }
    }

    return cleanedOutput
}

export function IncognitoChatWindow() {
    const { t } = useLanguage()
    const { isEasyLanguage } = useAccessibility()
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [messages, setMessages] = useState<EphemeralMessage[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [sessionId, setSessionId] = useState<string>('')
    const [attachedFile, setAttachedFile] = useState<File | null>(null)
    const [filePreview, setFilePreview] = useState<string | null>(null)
    const [showUploadInfo, setShowUploadInfo] = useState(false)

    // Count assistant messages for survey triggers
    const assistantMessageCount = useMemo(() => {
        return messages.filter(msg => msg.role === 'assistant').length
    }, [messages])

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!ACCEPTED_TYPES.includes(file.type)) {
            alert('Please select a PNG, JPEG, WebP, or PDF file.')
            return
        }

        if (file.size > MAX_FILE_SIZE) {
            alert('File is too large. Maximum size is 5MB.')
            return
        }

        setAttachedFile(file)

        if (file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onload = (e) => setFilePreview(e.target?.result as string)
            reader.readAsDataURL(file)
        } else {
            setFilePreview(null)
        }
    }

    const removeAttachment = () => {
        setAttachedFile(null)
        setFilePreview(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => {
                const result = reader.result as string
                const base64 = result.split(',')[1]
                resolve(base64)
            }
            reader.onerror = reject
            reader.readAsDataURL(file)
        })
    }

    // Initialize session and load messages from sessionStorage
    useEffect(() => {
        // Get or create session ID
        let storedSessionId = sessionStorage.getItem(SESSION_ID_KEY)
        if (!storedSessionId) {
            storedSessionId = uuidv4()
            sessionStorage.setItem(SESSION_ID_KEY, storedSessionId)
        }
        setSessionId(storedSessionId)

        // Load existing messages
        const storedMessages = sessionStorage.getItem(SESSION_STORAGE_KEY)
        if (storedMessages) {
            try {
                setMessages(JSON.parse(storedMessages))
            } catch (e) {
                console.error('Failed to parse stored messages', e)
            }
        }
    }, [])

    // Persist messages to sessionStorage whenever they change
    useEffect(() => {
        if (messages.length > 0) {
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(messages))
        }
    }, [messages])

    const sendMessage = useCallback(async (content: string, files?: FileAttachment[]) => {
        if ((!content.trim() && !files) || isLoading) return

        setIsLoading(true)

        // Add user message
        const userMessage: EphemeralMessage = {
            id: uuidv4(),
            role: 'user',
            content: content || (files ? `[Attached: ${files[0].name}]` : ''),
            status: 'complete',
            created_at: new Date().toISOString(),
            attachment: files && files.length > 0 ? { name: files[0].name, mimeType: files[0].mimeType } : undefined
        }

        setMessages(prev => [...prev, userMessage])

        // Add placeholder for assistant
        const assistantMessageId = uuidv4()
        const assistantMessage: EphemeralMessage = {
            id: assistantMessageId,
            role: 'assistant',
            content: '',
            status: 'streaming',
            created_at: new Date().toISOString()
        }

        setMessages(prev => [...prev, assistantMessage])

        try {
            const response = await fetch('/api/proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId,
                    chatId: `incognito-${sessionId}`,
                    userId: 'incognito',
                    message: isEasyLanguage
                        ? `${content || '[Document attached]'}\n\n[System Note: The user has requested Simple Language (Leichte Sprache). Please keep your response very simple, short, and easy to understand using basic vocabulary. Avoid complex sentence structures.]`
                        : (content || '[Document attached]'),
                    files: files && files.length > 0 ? files : undefined
                }),
            })

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.statusText}`)
            }

            const data = await response.json()
            const cleanedOutput = cleanModelOutput(data.output)

            if (!cleanedOutput || cleanedOutput.trim().length === 0) {
                throw new Error('Empty response from AI')
            }

            setMessages(prev => prev.map(msg =>
                msg.id === assistantMessageId
                    ? { ...msg, content: cleanedOutput, status: 'complete' }
                    : msg
            ))
        } catch (error: any) {
            console.error('Chat error:', error)
            setMessages(prev => prev.map(msg =>
                msg.id === assistantMessageId
                    ? { ...msg, content: `Error: ${error?.message || 'Failed to get response'}`, status: 'error' }
                    : msg
            ))
        } finally {
            setIsLoading(false)
        }
    }, [sessionId, isLoading, isEasyLanguage])

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if ((!input.trim() && !attachedFile) || isLoading) return

        const content = input.trim()
        setInput('')

        // Prepare file attachment if present
        let files: FileAttachment[] | undefined
        if (attachedFile) {
            const base64Data = await fileToBase64(attachedFile)

            // For PDFs, attempt client-side text extraction
            let extractedText: string | undefined
            let textExtractionSuccess = false

            if (isPdf(attachedFile.type)) {
                console.log('[PDF] Attempting client-side text extraction...')
                const extraction = await extractPdfText(attachedFile)
                extractedText = extraction.text
                textExtractionSuccess = extraction.success
                console.log(`[PDF] Extraction result: ${extraction.pageCount} pages, ${extraction.averageCharsPerPage.toFixed(0)} avg chars/page, success: ${extraction.success}`)
            }

            files = [{
                name: attachedFile.name,
                mimeType: attachedFile.type,
                base64Data,
                extractedText,
                textExtractionSuccess
            }]
            removeAttachment()
        }

        await sendMessage(content, files)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
    }

    // Auto-scroll on new messages
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages, isLoading])

    return (
        <div className="flex flex-col h-full bg-background relative overflow-hidden">
            {/* Incognito Banner */}
            <div className="bg-muted/50 border-b px-4 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-lg">👻</span>
                    <span>{t('incognitoBanner' as any)}</span>
                </div>
                <Link href="/login">
                    <Button size="sm" variant="default" className="gap-2">
                        <UserPlus className="h-4 w-4" />
                        {t('signUpToSave' as any)}
                    </Button>
                </Link>
            </div>

            {/* Survey Banner - sticky at top, appears after 3 bot messages */}
            <SurveyBanner messageCount={assistantMessageCount} threshold={3} />

            {/* Messages */}
            <ScrollArea className="flex-1 w-full min-h-0">
                <div className="flex flex-col gap-6 p-4 pb-32 max-w-3xl mx-auto">
                    {messages.length === 0 && !isLoading && (
                        <div className="flex flex-col items-center justify-center p-8 text-center mt-20">
                            <div className="h-16 w-16 mb-4">
                                <img src="/bot-avatar.svg" alt="BAföG Bot" className="w-full h-full" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">{t('greeting' as any)}</h3>
                            <p className="text-sm text-muted-foreground max-w-md">
                                {t('greetingSub' as any)}
                            </p>
                            <p className="text-xs text-muted-foreground/70 max-w-md mt-3">
                                {t('surveyWelcome' as any)}
                                <a
                                    href="https://umfragenup.uni-potsdam.de/Bafoeg_chatbot/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                >
                                    {t('surveyWelcomeLink' as any)}
                                </a>
                            </p>
                        </div>
                    )}

                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex gap-4 w-full",
                                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                            )}
                        >
                            <Avatar className="h-8 w-8 mt-1 border">
                                <AvatarFallback className={msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted"}>
                                    {msg.role === 'user' ? '?' : 'AI'}
                                </AvatarFallback>
                                {msg.role === 'assistant' && <AvatarImage src="/bot-avatar.svg" />}
                            </Avatar>

                            <div className={cn(
                                "flex flex-col gap-2 max-w-[85%]",
                                msg.role === 'user' ? "items-end" : "items-start"
                            )}>
                                {/* Loading state */}
                                {msg.role === 'assistant' && msg.status === 'streaming' && (
                                    <div className="rounded-lg px-4 py-3 bg-card border text-card-foreground shadow-sm">
                                        <ThinkingIndicator />
                                    </div>
                                )}

                                {/* Assistant completed */}
                                {msg.role === 'assistant' && msg.status !== 'streaming' && (
                                    <div className="rounded-2xl px-4 py-3 text-sm shadow-sm bg-card border text-card-foreground rounded-tl-sm w-full">
                                        <MarkdownRenderer content={msg.content} />
                                    </div>
                                )}

                                {/* User message */}
                                {msg.role === 'user' && (
                                    <div className="rounded-2xl px-4 py-3 text-sm shadow-sm bg-primary text-primary-foreground rounded-tr-sm">
                                        {/* Attachment indicator */}
                                        {msg.attachment && (
                                            <div className="mb-2 pb-2 border-b border-primary-foreground/20">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-10 w-10 bg-primary-foreground/20 rounded flex items-center justify-center">
                                                        <FileText className="h-5 w-5" />
                                                    </div>
                                                    <span className="text-xs opacity-80 truncate max-w-[150px]">{msg.attachment.name}</span>
                                                </div>
                                            </div>
                                        )}
                                        <div className="whitespace-pre-wrap">{msg.content}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t bg-background/80 backdrop-blur-sm z-10 w-full max-w-3xl mx-auto">
                {/* File Preview */}
                {attachedFile && (
                    <div className="mb-2 flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                        {filePreview ? (
                            <img src={filePreview} alt="Preview" className="h-12 w-12 object-cover rounded" />
                        ) : (
                            <div className="h-12 w-12 bg-muted rounded flex items-center justify-center">
                                <FileText className="h-6 w-6 text-muted-foreground" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{attachedFile.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {(attachedFile.size / 1024).toFixed(1)} KB
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={removeAttachment}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp,.pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                />

                <div className="relative flex gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 bottom-2 h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                    >
                        <Paperclip className="h-4 w-4" />
                    </Button>
                    <Textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t('inputPlaceholder' as any)}
                        className="min-h-[50px] max-h-[200px] resize-none pl-12 pr-12 py-3 rounded-xl border-muted-foreground/20 focus-visible:ring-1"
                        disabled={isLoading}
                    />
                    <Button
                        onClick={() => handleSubmit()}
                        disabled={(!input.trim() && !attachedFile) || isLoading}
                        size="icon"
                        className="absolute right-2 bottom-2 h-8 w-8 rounded-lg"
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </div>
                <div className="flex items-center justify-center gap-2 mt-2">
                    <p className="text-[10px] text-muted-foreground">
                        {t('aiDisclaimer' as any)}
                    </p>
                    <button
                        onClick={() => setShowUploadInfo(!showUploadInfo)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        title={t('uploadInfo' as any)}
                    >
                        <Info className="h-3 w-3" />
                    </button>
                </div>
                {showUploadInfo && (
                    <div className="mt-2 p-3 bg-muted/50 rounded-lg border text-xs text-muted-foreground whitespace-pre-line">
                        <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-foreground">{t('uploadInfo' as any)}</span>
                            <button onClick={() => setShowUploadInfo(false)} className="hover:text-foreground">
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                        {t('uploadDisclaimer' as any)}
                    </div>
                )}
            </div>

            {/* Survey Modal - appears once after 10+ messages */}
            <SurveyModal messageCount={assistantMessageCount} threshold={10} />
        </div>
    )
}
