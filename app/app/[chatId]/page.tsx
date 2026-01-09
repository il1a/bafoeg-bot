import { createClient } from '@/utils/supabase/server'
import { ChatWindow } from '@/components/ChatWindow'
import { notFound, redirect } from 'next/navigation'

interface ChatPageProps {
    params: Promise<{
        chatId: string
    }>
}

export default async function ChatPage({ params }: ChatPageProps) {
    const { chatId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // 1. Validate ownership of chat
    const { data: chat, error: chatError } = await supabase
        .from('chats')
        .select('*')
        .eq('id', chatId)
        .single()

    if (chatError || !chat) {
        notFound()
    }

    // 2. Fetch messages
    const { data: messages, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chat.id)
        .order('created_at', { ascending: true })

    return (
        <ChatWindow
            chat={chat}
            user={user}
            initialMessages={messages || []}
        />
    )
}
