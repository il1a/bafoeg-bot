import { useState, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Database } from '@/types/supabase'

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

interface UseChatStreamProps {
    sessionId: string
    chatId: string
    onMessageComplete?: (message: Message) => void
}

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 500

// Helper to clean model output
function cleanModelOutput(rawOutput: string): string {
    let cleanedOutput = rawOutput || ''

    // Look for common markers that indicate the start of the final answer
    const answerMarkers = [
        /assistantfinal\s*Answer/i,
        /\*\*Answer\*\*/i,
        /^Answer:/im,
        /final\s*Answer/i
    ]

    for (const marker of answerMarkers) {
        const match = cleanedOutput.match(marker)
        if (match && match.index !== undefined) {
            cleanedOutput = cleanedOutput.substring(match.index)
            cleanedOutput = cleanedOutput.replace(/^assistantfinal\s*/i, '')
            break
        }
    }

    // If the output still contains "analysis" at the start, try to find where it ends
    if (cleanedOutput.toLowerCase().startsWith('analysis')) {
        const answerStart = cleanedOutput.search(/\*\*Answer\*\*|^Answer/im)
        if (answerStart > 0) {
            cleanedOutput = cleanedOutput.substring(answerStart)
        }
    }

    return cleanedOutput
}

export function useChatStream({ sessionId, chatId, onMessageComplete }: UseChatStreamProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const sendMessage = useCallback(async (content: string, userId: string) => {
        setIsLoading(true)
        const requestStartTime = Date.now()

        // 1. Add User Message immediately (Optimistic)
        const userMessage: Message = {
            id: uuidv4(),
            chat_id: chatId,
            user_id: userId,
            role: 'user',
            content,
            events: null,
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
                        message: content
                    }),
                })

                if (!response.ok) {
                    throw new Error(`HTTP Error: ${response.statusText}`)
                }

                const data: N8nResponse = await response.json()
                const cleanedOutput = cleanModelOutput(data.output)

                // Check for empty response — retry if empty
                if (!cleanedOutput || cleanedOutput.trim().length === 0) {
                    console.warn(`[Attempt ${attempt}/${MAX_RETRIES}] Empty response from n8n, retrying...`)
                    lastError = new Error('Empty response from AI')

                    if (attempt < MAX_RETRIES) {
                        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS))
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
                                output: step.observation
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
                    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS))
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
