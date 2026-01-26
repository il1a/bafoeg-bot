'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { Send, StopCircle, ChevronDown, ChevronUp, Cpu, Sparkles, FileText, BrainCircuit, Loader2, Paperclip, X, Info } from 'lucide-react'
import { useChat, FileAttachment } from '@/hooks/useChat'
import { ChatService } from '@/services/chatService'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import MarkdownRenderer from '@/components/markdown/MarkdownRenderer'
import { Database } from '@/types/supabase'
import { useLanguage } from '@/contexts/language-context'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { OnboardingModal } from '@/components/onboarding-modal'
import { extractPdfText, isPdf } from '@/utils/pdf-extractor'
import { SurveyBanner } from '@/components/SurveyBanner'
import { SurveyModal } from '@/components/SurveyModal'
import { DataSourceBadge } from '@/components/DataSourceBadge'
import { useAccessibility } from '@/contexts/accessibility-context'
import { ExamplePrompts } from '@/components/ExamplePrompts'

type Message = Database['public']['Tables']['messages']['Row']
type Chat = Database['public']['Tables']['chats']['Row']

interface ChatWindowProps {
    chat: Chat
    user: any
    initialMessages?: Message[]
}

// Animated thinking indicator component
function ThinkingIndicator() {
    const { t } = useLanguage()
    const [dotCount, setDotCount] = useState(0)
    const [phase, setPhase] = useState(0)

    // Fallback if translation missing or array issue
    const phases = (t('phases') as any) || ['Thinking', 'Searching', 'Processing']
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

// Collapsible tool details component
function ToolCallDetails({ events }: { events: any[] }) {
    const { t } = useLanguage()
    const [isOpen, setIsOpen] = useState(false)
    const toolCalls = events.filter(evt => evt.type === 'tool_call')

    if (toolCalls.length === 0) return null

    return (
        <div className="mt-2 w-full">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CollapsibleTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2 p-0 h-auto text-xs text-muted-foreground hover:text-foreground hover:bg-transparent"
                    >
                        <BrainCircuit className="h-3 w-3" />
                        <span>
                            {t('agentLogic' as any)} ({toolCalls.length} {t('toolsUsed' as any)})
                        </span>
                        <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", isOpen && "rotate-180")} />
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="mt-2 space-y-3 pl-2 border-l-2 border-muted">
                        {toolCalls.map((evt, idx) => (
                            <div key={idx} className="text-xs space-y-1">
                                <div className="font-semibold text-foreground">
                                    {evt.data?.tool || 'Tool'}
                                </div>
                                {evt.data?.input && (
                                    <div className="text-muted-foreground break-words bg-muted/30 p-2 rounded font-mono text-[10px]">
                                        Query: {evt.data.input}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    )
}

export function ChatWindow({ chat, user, initialMessages = [] }: ChatWindowProps) {
    const { t } = useLanguage()
    const { fontSize } = useAccessibility()
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)


    // Callback to save message when streaming is done
    const handleMessageComplete = async (msg: Message) => {
        try {
            await ChatService.saveMessage({
                chat_id: chat.id,
                user_id: user.id,
                role: msg.role,
                content: msg.content,
                events: msg.events,
                status: msg.status
            })
        } catch (e) {
            console.error("Failed to save message", e)
        }
    }

    const { messages, sendMessage, isLoading, setMessages } = useChat({
        sessionId: chat.session_id,
        chatId: chat.id,
        onMessageComplete: handleMessageComplete
    })

    const isStreaming = isLoading;

    // Initialize messages
    useEffect(() => {
        if (initialMessages.length > 0) {
            setMessages(initialMessages)
        }
    }, [initialMessages, setMessages])

    // Count assistant messages for survey triggers
    const assistantMessageCount = useMemo(() => {
        return messages.filter(msg => msg.role === 'assistant').length
    }, [messages])

    const [input, setInput] = useState('')
    const [attachedFile, setAttachedFile] = useState<File | null>(null)
    const [filePreview, setFilePreview] = useState<string | null>(null)
    const [showUploadInfo, setShowUploadInfo] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
    const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf']

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

        // Create preview for images
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
                // Remove data URL prefix to get raw base64
                const base64 = result.split(',')[1]
                resolve(base64)
            }
            reader.onerror = reject
            reader.readAsDataURL(file)
        })
    }

    const handleSubmit = async (e?: React.FormEvent, contentOverride?: string) => {
        e?.preventDefault()
        // Use override if provided, otherwise fallback to state
        const contentToUse = contentOverride || input.trim()

        if ((!contentToUse && !attachedFile) || isLoading) return

        const content = contentToUse
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

        // Save User Message to DB immediately (fire and forget or await)
        // Store lightweight attachment metadata (no base64) for display after reload
        try {
            await ChatService.saveMessage({
                chat_id: chat.id,
                user_id: user.id,
                role: 'user',
                content: content || (files ? `[Attached: ${files[0].name}]` : ''),
                events: files && files.length > 0 ? [{ type: 'attachment', data: { name: files[0].name, mimeType: files[0].mimeType } }] : null,
                status: 'complete'
            })
        } catch (e) {
            console.error("Failed to save user message", e)
        }

        // Auto-rename chat if it's the first message
        if (messages.length === 0) {
            const newTitle = (content || attachedFile?.name || 'New Chat').split('\n')[0].substring(0, 40) + ((content?.length || 0) > 40 ? '...' : '')
            ChatService.updateChatTitle(chat.id, newTitle)
                .then(() => {
                    window.dispatchEvent(new CustomEvent('chat-title-updated', {
                        detail: { chatId: chat.id, title: newTitle }
                    }))
                })
                .catch(console.error)
        }

        await sendMessage(content || '[Document attached]', user.id, files)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
    }

    // Auto-scroll on new messages or loading state change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages, isLoading])


    return (
        <div className="flex flex-col h-full bg-background relative overflow-hidden">
            <OnboardingModal />
            {/* Survey Banner - sticky at top, appears after 3 bot messages */}
            <SurveyBanner messageCount={assistantMessageCount} threshold={3} />

            {/* Messages */}
            <ScrollArea className="flex-1 w-full min-h-0">
                <div className={cn(
                    "flex flex-col gap-6 p-4 max-w-3xl mx-auto", // Removed pb-32 to handle it dynamically or in inner content
                    messages.length === 0 ? "h-full" : "pb-32"
                )}>
                    {messages.length === 0 && !isLoading && (
                        <div className="flex flex-col h-full">
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center mt-4">

                                <h3 className="text-xl font-semibold mb-3">{t('greeting' as any)}</h3>
                                <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                                    {t('greetingSub' as any)}
                                </p>



                                <p className="text-xs text-muted-foreground/70 max-w-md mt-5 leading-relaxed">
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
                                {/* Data source transparency badge */}
                                <DataSourceBadge variant="full" className="mt-6 max-w-md" />
                            </div>

                            <div className="w-full px-4 pb-4">
                                <ExamplePrompts
                                    onSelect={(text) => handleSubmit(undefined, text)}
                                    className="mt-auto"
                                />
                            </div>
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
                                    {msg.role === 'user' ? 'I' : 'AI'}
                                </AvatarFallback>
                                {msg.role === 'assistant' && <AvatarImage src="/bot-avatar.svg" />}
                            </Avatar>

                            <div className={cn(
                                "flex flex-col gap-2 max-w-[85%]", // Increased width slightly
                                msg.role === 'user' ? "items-end" : "items-start"
                            )}>
                                {/* Loading state for assistant message */}
                                {msg.role === 'assistant' && msg.status === 'streaming' && (
                                    <div className="rounded-lg px-4 py-3 bg-card border text-card-foreground shadow-sm">
                                        <ThinkingIndicator />
                                    </div>
                                )}

                                {/* Completed message content */}
                                {msg.role === 'assistant' && msg.status !== 'streaming' && (
                                    <>
                                        <div className="rounded-2xl px-4 py-3 text-sm shadow-sm bg-card border text-card-foreground rounded-tl-sm w-full">
                                            <MarkdownRenderer content={msg.content} />
                                        </div>

                                        {/* Tool call details (collapsible) */}
                                        {msg.events && (msg.events as any[]).length > 0 && (
                                            <ToolCallDetails events={msg.events as any[]} />
                                        )}

                                        {/* Metrics */}
                                        {msg.events && (
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {(msg.events as any[]).map((evt, idx) => {
                                                    if (evt.type === 'metrics' && evt.data?.duration) {
                                                        return (
                                                            <span key={idx} className="text-[10px] text-muted-foreground flex items-center gap-1 opacity-70">
                                                                {t('generatedIn' as any)} {evt.data.duration}s
                                                            </span>
                                                        )
                                                    }
                                                    return null
                                                })}
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* User message */}
                                {msg.role === 'user' && (
                                    <div className="rounded-2xl px-4 py-3 text-sm shadow-sm bg-primary text-primary-foreground rounded-tr-sm">
                                        {/* Attachment preview */}
                                        {msg.events && (msg.events as any[]).some(e => e.type === 'attachment') && (
                                            <div className="mb-2 pb-2 border-b border-primary-foreground/20">
                                                {(msg.events as any[]).filter(e => e.type === 'attachment').map((evt, idx) => (
                                                    <div key={idx} className="flex items-center gap-2">
                                                        {evt.data?.preview ? (
                                                            <img src={evt.data.preview} alt="Attachment" className="h-16 w-16 object-cover rounded" />
                                                        ) : (
                                                            <div className="h-10 w-10 bg-primary-foreground/20 rounded flex items-center justify-center">
                                                                <FileText className="h-5 w-5" />
                                                            </div>
                                                        )}
                                                        <span className="text-xs opacity-80 truncate max-w-[150px]">{evt.data?.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className="whitespace-pre-wrap">{msg.content}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Scroll Anchor */}
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
                        {isLoading ? <StopCircle className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                    </Button>
                </div>
                <div className="flex items-center justify-center gap-2 mt-2">
                    <p className={cn(
                        "text-muted-foreground",
                        fontSize === 'normal' ? 'text-[10px]' : fontSize === 'large' ? 'text-xs' : 'text-sm'
                    )}>
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
