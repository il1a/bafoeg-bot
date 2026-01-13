'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, StopCircle, ChevronDown, ChevronUp, Cpu, Sparkles, FileText, BrainCircuit, Loader2 } from 'lucide-react'
import { useChatStream } from '@/hooks/useChatStream'
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

    const { messages, sendMessage, isLoading, setMessages } = useChatStream({
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

    const [input, setInput] = useState('')

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!input.trim() || isLoading) return

        const content = input.trim()
        setInput('')

        // Save User Message to DB immediately (fire and forget or await)
        try {
            await ChatService.saveMessage({
                chat_id: chat.id,
                user_id: user.id,
                role: 'user',
                content: content,
                status: 'complete'
            })
        } catch (e) {
            console.error("Failed to save user message", e)
        }

        // Auto-rename chat if it's the first message
        if (messages.length === 0) {
            const newTitle = content.split('\n')[0].substring(0, 40) + (content.length > 40 ? '...' : '')
            ChatService.updateChatTitle(chat.id, newTitle)
                .then(() => {
                    window.dispatchEvent(new CustomEvent('chat-title-updated', {
                        detail: { chatId: chat.id, title: newTitle }
                    }))
                })
                .catch(console.error)
        }

        await sendMessage(content, user.id)
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
                <div className="relative flex gap-2">
                    <Textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t('inputPlaceholder' as any)}
                        className="min-h-[50px] max-h-[200px] resize-none pr-12 py-3 rounded-xl border-muted-foreground/20 focus-visible:ring-1"
                        disabled={isLoading}
                    />
                    <Button
                        onClick={() => handleSubmit()}
                        disabled={!input.trim() || isLoading}
                        size="icon"
                        className="absolute right-2 bottom-2 h-8 w-8 rounded-lg"
                    >
                        {isLoading ? <StopCircle className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                    </Button>
                </div>
                <div className="text-center mt-2">
                    <p className="text-[10px] text-muted-foreground">
                        {t('aiDisclaimer' as any)}
                    </p>
                </div>
            </div>
        </div>
    )
}
