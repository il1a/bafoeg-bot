import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { MessageSquarePlus } from 'lucide-react'

export default async function AppIndesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // If we wanted to auto-redirect to latest chat:
    /*
    const { data: chats } = await supabase
      .from('chats')
      .select('id')
      .eq('user_id', user?.id!)
      .order('updated_at', { ascending: false })
      .limit(1)
  
    if (chats && chats.length > 0) {
      redirect(`/app/${chats[0].id}`)
    }
    */

    return (
        <div className="flex h-full flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <div className="rounded-full bg-muted p-4 mb-4">
                <MessageSquarePlus className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Welcome to BAföG Bot</h2>
            <p className="max-w-xs mx-auto mb-6">
                Select a chat from the sidebar or start a new conversation to ask your BAföG questions.
            </p>
        </div>
    )
}
