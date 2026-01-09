import { createClient } from '@/utils/supabase/client'
import { v4 as uuidv4 } from 'uuid'
import { Database } from '@/types/supabase'

type Message = Database['public']['Tables']['messages']['Insert']
type Chat = Database['public']['Tables']['chats']['Row']

export const ChatService = {
    async getChats() {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('chats')
            .select('*')
            .order('updated_at', { ascending: false })

        if (error) throw error
        return data as Chat[]
    },

    async createChat(userId: string, title: string = 'New Chat') {
        const supabase = createClient()
        const sessionId = uuidv4()

        const { data, error } = await supabase
            .from('chats')
            .insert({
                user_id: userId,
                session_id: sessionId,
                title
            })
            .select()
            .single()

        if (error) throw error
        return data as Chat
    },

    async getMessages(chatId: string) {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chatId)
            .order('created_at', { ascending: true })

        if (error) throw error
        return data
    },

    async saveMessage(message: Message) {
        const supabase = createClient()
        const { error } = await supabase
            .from('messages')
            .insert(message)

        if (error) throw error
    },

    async deleteChat(chatId: string) {
        const supabase = createClient()
        const { error } = await supabase
            .from('chats')
            .delete()
            .eq('id', chatId)

        if (error) throw error
    },

    async updateChatTitle(chatId: string, title: string) {
        const supabase = createClient()
        const { error } = await supabase
            .from('chats')
            .update({ title })
            .eq('id', chatId)

        if (error) throw error
    }
}
