import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Sidebar } from '@/components/Sidebar'
import { AppShell } from '@/components/AppShell'
import { Toaster } from 'sonner'

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch chats for sidebar
    const { data: chats } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

    return (
        <AppShell sidebar={<Sidebar initialChats={chats || []} user={user} />}>
            {children}
            <Toaster />
        </AppShell>
    )
}
