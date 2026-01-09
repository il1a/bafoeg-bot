import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        console.log('[Proxy] Forwarding request to n8n:', body)

        const response = await fetch('https://n8n.ilia.work/webhook/019ba917-976f-4cef-946f-789f492f7351', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
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
