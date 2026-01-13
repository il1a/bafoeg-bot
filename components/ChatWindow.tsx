'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, StopCircle, ChevronDown, ChevronUp, Cpu, Sparkles } from 'lucide-react'
import { useChatStream } from '@/hooks/useChatStream'
import { ChatService } from '@/services/chatService'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import MarkdownRenderer from '@/components/markdown/MarkdownRenderer'
import { Database } from '@/types/supabase'

type Message = Database['public']['Tables']['messages']['Row']
type Chat = Database['public']['Tables']['chats']['Row']

interface ChatWindowProps {
    chat: Chat
    user: any
    initialMessages?: Message[]
}

// Animated thinking indicator component
function ThinkingIndicator() {
    const [dotCount, setDotCount] = useState(0)
    const [phase, setPhase] = useState(0)

    const phases = [
        "Thinking",
        "Searching BAföG database",
        "Analyzing information",
        "Generating response"
    ]

    useEffect(() => {
        const dotInterval = setInterval(() => {
            setDotCount(prev => (prev + 1) % 4)
        }, 400)

        const phaseInterval = setInterval(() => {
            setPhase(prev => (prev + 1) % phases.length)
        }, 2500)

        return () => {
            clearInterval(dotInterval)
            clearInterval(phaseInterval)
        }
    }, [])

    return (
        <div className="flex items-center gap-3 text-muted-foreground">
            <div className="relative">
                <Sparkles className="h-4 w-4 animate-pulse text-primary" />
            </div>
            <span className="text-sm">
                {phases[phase]}{'.'.repeat(dotCount)}
            </span>
        </div>
    )
}

// Collapsible tool details component
function ToolCallDetails({ events }: { events: any[] }) {
    const [isOpen, setIsOpen] = useState(false)
    const toolCalls = events.filter(evt => evt.type === 'tool_call')

    if (toolCalls.length === 0) return null

    return (
        <div className="w-full">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
            >
                <Cpu className="h-3 w-3" />
                <span>View agent reasoning ({toolCalls.length} tool{toolCalls.length > 1 ? 's' : ''} used)</span>
                {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>

            {isOpen && (
                <div className="mt-2 space-y-2 pl-5 border-l-2 border-muted">
                    {toolCalls.map((evt, idx) => (
                        <div key={idx} className="text-xs space-y-1">
                            <div className="font-medium text-foreground">
                                {evt.data?.tool || 'Tool'}
                            </div>
                            {evt.data?.input && (
                                <div className="text-muted-foreground">
                                    Query: <span className="font-mono">{evt.data.input}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export function ChatWindow({ chat, user, initialMessages = [] }: ChatWindowProps) {
    const scrollRef = useRef<HTMLDivElement>(null)


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

        // Auto-rename chat if it's the first message (don't refresh — that loses state!)
        if (messages.length === 0) {
            const newTitle = content.split('\n')[0].substring(0, 40) + (content.length > 40 ? '...' : '')
            // Fire and forget — don't await or refresh, sidebar will update on next navigation
            ChatService.updateChatTitle(chat.id, newTitle).catch(console.error)
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
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages, isLoading])

    return (
        <div className="flex flex-col h-full bg-background relative overflow-hidden">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
                <div className="flex flex-col gap-6 max-w-3xl mx-auto pb-4">
                    {messages.length === 0 && !isLoading && (
                        <div className="flex flex-col items-center justify-center p-8 text-center mt-20">
                            <div className="h-16 w-16 mb-4">
                                <img src="/bot-avatar.svg" alt="BAföG Bot" className="w-full h-full" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Hallo! I'm your BAföG assistant 👋</h3>
                            <p className="text-sm text-muted-foreground max-w-md">
                                Ask me anything about BAföG — eligibility, application process, documents, deadlines, or repayment. I speak multiple languages!
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
                                    {msg.role === 'user' ? user?.email?.[0]?.toUpperCase() || 'U' : 'AI'}
                                </AvatarFallback>
                                {msg.role === 'assistant' && <AvatarImage src="/bot-avatar.svg" />}
                            </Avatar>

                            <div className={cn(
                                "flex flex-col gap-2 max-w-[80%]",
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
                                        <div className={cn(
                                            "rounded-lg px-4 py-2 text-sm shadow-sm",
                                            "bg-card border text-card-foreground"
                                        )}>
                                            <MarkdownRenderer content={msg.content} />
                                        </div>

                                        {/* Tool call details (collapsible) */}
                                        {msg.events && (msg.events as any[]).length > 0 && (
                                            <ToolCallDetails events={msg.events as any[]} />
                                        )}

                                        {/* Metrics */}
                                        {msg.events && (
                                            <div className="flex flex-wrap gap-2">
                                                {(msg.events as any[]).map((evt, idx) => {
                                                    if (evt.type === 'metrics' && evt.data?.duration) {
                                                        return (
                                                            <span key={idx} className="text-[10px] text-muted-foreground flex items-center gap-1 opacity-70">
                                                                Generated in {evt.data.duration}s
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
                                    <div className="rounded-lg px-4 py-2 text-sm shadow-sm bg-primary text-primary-foreground">
                                        <div className="whitespace-pre-wrap">{msg.content}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Scroll Anchor */}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="max-w-3xl mx-auto flex gap-2 relative">
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about BAföG..."
                        className="min-h-[50px] max-h-[200px] resize-none pr-12 py-3"
                        disabled={isLoading}
                    />
                    <Button
                        onClick={() => handleSubmit()}
                        disabled={!input.trim() || isLoading}
                        size="icon"
                        className="absolute right-2 bottom-2 h-8 w-8"
                    >
                        {isLoading ? <StopCircle className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                    </Button>
                </div>
                <div className="text-center mt-2">
                    <p className="text-[10px] text-muted-foreground">
                        AI can make mistakes. Please verify important information.
                    </p>
                </div>
            </div>
        </div>
    )
}
