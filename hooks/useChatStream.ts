import { useState, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Database } from '@/types/supabase'
import { useAccessibility } from '@/contexts/accessibility-context'

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

// File attachment for document uploads
export interface FileAttachment {
    name: string
    mimeType: string
    base64Data: string
    extractedText?: string      // Pre-extracted text from PDFs (client-side)
    textExtractionSuccess?: boolean  // True if text was successfully extracted
}

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 500

// Helper to clean model output
function cleanModelOutput(rawOutput: string): string {
    if (!rawOutput) return ''
    let cleanedOutput = rawOutput

    // Priority 1: Specific "assistantfinal" markers (Logic: Take the LAST occurrence)
    // This handles cases where the model echoes instructions containing these markers.
    // The real answer's marker will always be after the instructions.
    const functionalMarkers = [
        /answer\.assistantfinal\s*(?:\*\*Antwort\*\*)?/i,
        /answer\.assistantfinal\s*(?:\*\*Answer\*\*)?/i,
        /assistantfinal\s*(?:\*\*Antwort\*\*)?/i,
        /assistantfinal\s*(?:\*\*Answer\*\*)?/i,
    ]

    for (const marker of functionalMarkers) {
        // Find all matches to select the last one
        const matches = [...cleanedOutput.matchAll(new RegExp(marker, 'gi'))]
        if (matches.length > 0) {
            const lastMatch = matches[matches.length - 1]
            if (lastMatch.index !== undefined) {
                return cleanedOutput.substring(lastMatch.index + lastMatch[0].length).trim()
            }
        }
    }

    // Priority 2: Standard Markdown markers (Logic: check common formats)
    // We check these if no functional marker is found.
    const standardMarkers = [
        /\*\*Antwort\*\*[:]?/i,
        /\*\*Answer\*\*[:]?/i,
        /^\s*Answer:/im,
        /^\s*Antwort:/im
    ]

    for (const marker of standardMarkers) {
        const match = cleanedOutput.match(marker)
        if (match && match.index !== undefined) {
            // For standard markers, we take the first match that looks "clean".
            // However, to avoid matching "Answer section:" in instructions:
            // 1. If it's `^Answer:`, it must be start of line.
            // 2. If it is `**Answer**`, it's usually safe, unless instructions have it.

            // If we are here, we didn't find assistantfinal.
            // Verify it's not "Answer section:"
            const potentialStart = cleanedOutput.substring(match.index)
            if (potentialStart.match(/^\s*Answer section:/i)) {
                continue // Skip this match, it's likely instructions
            }

            // Also skip if it seems to be part of a sentence like "The Answer is..." unless bolded
            if (!marker.source.includes('\\*\\*') && !marker.source.includes('^')) {
                // If soft match, be careful (we removed soft matches from the list above)
            }

            return potentialStart.replace(marker, '').trim() // Remove the marker itself for clean start? 
            // Actually, keep the marker? 
            // - `assistantfinal` -> Remove.
            // - `**Answer**` -> Keep? Or remove?
            // The previous code kept it (substring includes start).
            // But `assistantfinal` removal was explicit.

            // Let's remove the marker to be clean, or keep it if it's a visible header.
            // Standard markers are usually visible headers. Let's keep them IF they are formatted nicities.
            // But `assistantfinal` is a system token, so we removed it.
            // `**Antwort**` is a header. Keep it.
            return potentialStart
        }
    }

    // Fallback: If "analysis" is at start, try detailed cleanup
    if (cleanedOutput.toLowerCase().startsWith('analysis')) {
        const answerStart = cleanedOutput.search(/\*\*Answer\*\*|\*\*Antwort\*\*|^Answer:|^Antwort:/im)
        if (answerStart > 0) {
            return cleanedOutput.substring(answerStart)
        }
    }

    // Final cleanup: Remove any standalone "Antwort" or "Answer" at the very start
    // This catches cases like "Antwort\n\n", "Answer:\n", "**Antwort**\n", etc.
    cleanedOutput = cleanedOutput.replace(/^\s*(?:\*\*)?(?:Antwort|Answer)(?:\*\*)?:?\s*/i, '').trim()

    // Remove any stray markdown asterisks left at the beginning after cleanup
    cleanedOutput = cleanedOutput.replace(/^[\s*]+/, '').trim()

    return cleanedOutput
}

export function useChatStream({ sessionId, chatId, onMessageComplete }: UseChatStreamProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const { isEasyLanguage } = useAccessibility()

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
                        files: files && files.length > 0 ? files : undefined
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
