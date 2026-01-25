import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'


import { redactPII, logRedactionAudit } from '@/utils/pii-redactor'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        const body = await req.json()

        // DSGVO Compliance: Redact PII from user message before forwarding
        let sanitizedBody = { ...body }
        if (body.message && typeof body.message === 'string') {
            const redactionResult = redactPII(body.message)
            sanitizedBody.message = redactionResult.redactedText

            // Audit log (without actual PII values)
            if (redactionResult.hasRedactions) {
                logRedactionAudit(body.sessionId || 'unknown', redactionResult)
            }
        }

        console.log('[Proxy] Forwarding request to n8n:', sanitizedBody)

        // Initialize Supabase Server Client for Auth Check
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet: { name: string, value: string, options: CookieOptions }[]) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
                        } catch {
                            // The `setAll` method was called from a Server Component.
                            // This can be ignored if you have middleware refreshing
                            // user sessions.
                        }
                    },
                },
            }
        )

        // Verify Authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            console.error('[Proxy] Unauthorized access attempt')
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Validate environment variables
        const webhookUrl = process.env.N8N_WEBHOOK_URL
        const webhookSecret = process.env.N8N_WEBHOOK_SECRET

        // Mock Mode for local development without backend keys
        if (process.env.MOCK_N8N === 'true') {
            console.log('[Proxy] Mock mode active. Returning simulated response.')
            await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate network lag
            return NextResponse.json({
                output: "assistantfinal **Antwort**\n\nDies ist eine simulierte Antwort des BAföG-Bots, da der Mock-Modus aktiviert ist. In einer echten Umgebung würde hier das Ergebnis der RAG-Pipeline von n8n stehen.",
                intermediateSteps: [
                    {
                        action: { tool: "Mock Search", toolInput: "BAföG Grundbedarf", log: "Searching mock database...", toolCallId: "123", type: "search" },
                        observation: "Found pseudo-information about BAföG thresholds."
                    }
                ]
            })
        }

        if (!webhookUrl) {
            console.error('[Proxy] Missing N8N_WEBHOOK_URL environment variable')
            return NextResponse.json({ error: 'Webhook configuration missing' }, { status: 500 })
        }

        if (!webhookSecret) {
            console.error('[Proxy] Missing N8N_WEBHOOK_SECRET environment variable')
            return NextResponse.json({ error: 'Webhook authentication missing' }, { status: 500 })
        }

        // Pass user ID context to n8n if needed
        const payload = {
            ...sanitizedBody,
            userId: user.id
        }

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'bafoeg-webhook-key': webhookSecret,
            },
            body: JSON.stringify(payload),
        })

        if (!response.ok) {
            console.error('[Proxy] n8n error:', response.status, response.statusText)
            return NextResponse.json({ error: response.statusText }, { status: response.status })
        }

        // Parse JSON response from n8n
        const data = await response.json()
        console.log('[Proxy] Response from n8n:', JSON.stringify(data).substring(0, 500))

        return NextResponse.json(data)

    } catch (error: any) {
        console.error('[Proxy] Fatal error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
