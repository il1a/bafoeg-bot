import { useState, useCallback, useRef, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Database } from '@/types/supabase'
import { useAccessibility } from '@/contexts/accessibility-context'
import { cleanModelOutput } from '@/utils/clean-text'

type Message = Database['public']['Tables']['messages']['Row']

// Intermediate step from n8n agent
interface IntermediateStep {
    action: {
        tool: string
        toolInput: string
        log: string
        toolCallId: string
        type: string
    }
    observation: string
}

// n8n response format
interface N8nResponse {
    output: string
    intermediateSteps?: IntermediateStep[]
}

export type ChatState = {
    messages: Message[]
    isLoading: boolean
}

interface UseChatProps {
    sessionId: string
    chatId: string
    onMessageComplete?: (message: Message) => void
}

// File attachment for document uploads
export interface FileAttachment {
    name: string
    mimeType: string
    base64Data: string
    extractedText?: string      // Pre-extracted text from PDFs (client-side)
    textExtractionSuccess?: boolean  // True if text was successfully extracted
}

export function useChat({ sessionId, chatId, onMessageComplete }: UseChatProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const { isEasyLanguage } = useAccessibility()

    // Ref to access latest messages in sendMessage callback
    const messagesRef = useRef<Message[]>([])
    useEffect(() => {
        messagesRef.current = messages
    }, [messages])

    const sendMessage = useCallback(async (content: string, userId: string, files?: FileAttachment[]) => {
        setIsLoading(true)
        const requestStartTime = Date.now()

        // 1. Add User Message immediately (Optimistic)
        // Include file attachment info for display in the message bubble (no preview for consistency)
        const userMessage: Message = {
            id: uuidv4(),
            chat_id: chatId,
            user_id: userId,
            role: 'user',
            content,
            events: files && files.length > 0 ? [{ type: 'attachment', data: { name: files[0].name, mimeType: files[0].mimeType } }] : null,
            status: 'complete',
            created_at: new Date().toISOString()
        }

        setMessages(prev => [...prev, userMessage])

        // 2. Prepare Assistant Message Placeholder (show loading state)
        const assistantMessageId = uuidv4()
        const assistantMessage: Message = {
            id: assistantMessageId,
            chat_id: chatId,
            user_id: userId,
            role: 'assistant',
            content: '',
            events: [],
            status: 'streaming',
            created_at: new Date().toISOString()
        }

        setMessages(prev => [...prev, assistantMessage])

        const MAX_RETRIES = 3
        const INITIAL_RETRY_DELAY = 1000

        // Retry loop for handling empty responses from OpenRouter
        let lastError: Error | null = null

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                const response = await fetch('/api/proxy', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        sessionId,
                        chatId,
                        userId,
                        message: isEasyLanguage
                            ? `${content}\n\n[System Note: The user has requested Simple Language (Leichte Sprache). Please keep your response very simple, short, and easy to understand using basic vocabulary. Avoid complex sentence structures.]`
                            : content,
                        files: files && files.length > 0 ? files : undefined,
                        chatHistory: messagesRef.current
                            .filter((m: Message) => m.status === 'complete' && m.content)
                            .slice(-10)
                            .map((m: Message) => ({
                                role: m.role,
                                content: m.content
                            }))
                    }),
                })

                if (!response.ok) {
                    // Only retry on 5xx server errors
                    if (response.status >= 500 && attempt < MAX_RETRIES) {
                        const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1)
                        console.warn(`[Chat] Server error ${response.status}. Retrying in ${delay}ms (Attempt ${attempt}/${MAX_RETRIES})...`)
                        await new Promise(resolve => setTimeout(resolve, delay))
                        continue
                    }
                    throw new Error(`HTTP Error: ${response.statusText}`)
                }

                const data: N8nResponse = await response.json()
                const cleanedOutput = cleanModelOutput(data.output)

                // Check for empty response — retry if empty
                if (!cleanedOutput || cleanedOutput.trim().length === 0) {
                    console.warn(`[Attempt ${attempt}/${MAX_RETRIES}] Empty response from n8n, retrying...`)
                    lastError = new Error('Empty response from AI')

                    if (attempt < MAX_RETRIES) {
                        const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1)
                        await new Promise(resolve => setTimeout(resolve, delay))
                        continue
                    }
                    throw lastError
                }

                // Success! Calculate duration and finalize
                const durationMs = Date.now() - requestStartTime
                const durationSec = (durationMs / 1000).toFixed(1)

                // Transform intermediate steps into events for the UI
                const events: any[] = []

                if (data.intermediateSteps && data.intermediateSteps.length > 0) {
                    for (const step of data.intermediateSteps) {
                        events.push({
                            type: 'tool_call',
                            data: {
                                tool: step.action.tool,
                                input: step.action.toolInput,
                                log: step.action.log,
                                toolCallId: step.action.toolCallId,
                                type: step.action.type
                                // output: step.observation // Removed to reduce payload size
                            }
                        })
                    }
                }

                events.push({ type: 'metrics', data: { duration: durationSec } })

                const finalMessage: Message = {
                    ...assistantMessage,
                    content: cleanedOutput,
                    events: events,
                    status: 'complete'
                }

                setMessages(prev => prev.map(msg =>
                    msg.id === assistantMessageId ? finalMessage : msg
                ))

                if (onMessageComplete) {
                    onMessageComplete(finalMessage)
                }

                // Success — exit the retry loop
                setIsLoading(false)
                return

            } catch (error: any) {
                console.error(`[Attempt ${attempt}/${MAX_RETRIES}] Request failed:`, error)
                lastError = error

                if (attempt < MAX_RETRIES) {
                    const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1)
                    await new Promise(resolve => setTimeout(resolve, delay))
                    continue
                }
            }
        }

        // All retries exhausted — show error
        setMessages(prev => prev.map(msg => {
            if (msg.id === assistantMessageId) {
                return {
                    ...msg,
                    status: 'error' as const,
                    content: `Error: ${lastError?.message || 'Failed to get response from AI after multiple attempts'}`
                }
            }
            return msg
        }))
        setIsLoading(false)

    }, [sessionId, chatId, onMessageComplete])

    return {
        messages,
        setMessages,
        sendMessage,
        isLoading
    }
}
