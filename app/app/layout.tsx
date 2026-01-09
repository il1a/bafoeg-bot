import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Sidebar } from '@/components/Sidebar'
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
        <div className="flex h-screen w-full bg-background">
            <aside className="w-[280px] hidden md:block h-full">
                <Sidebar initialChats={chats || []} user={user} />
            </aside>
            <main className="flex-1 flex flex-col h-full overflow-hidden">
                {children}
            </main>
            <Toaster />
        </div>
    )
}
