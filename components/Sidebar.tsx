'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Plus, MessageSquare, LogOut, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatService } from '@/services/chatService'
import { Database } from '@/types/supabase'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type Chat = Database['public']['Tables']['chats']['Row']

interface SidebarProps {
    initialChats?: Chat[]
    user?: any
}

export function Sidebar({ initialChats = [], user }: SidebarProps) {
    const [chats, setChats] = useState<Chat[]>(initialChats)
    const router = useRouter()
    const pathname = usePathname()
    const supabase = createClient()

    useEffect(() => {
        // Keep chats in sync if updated elsewhere (basic impl)
        setChats(initialChats)
    }, [initialChats])

    const handleNewChat = async () => {
        if (!user) return
        try {
            const newChat = await ChatService.createChat(user.id)
            setChats([newChat, ...chats])
            router.push(`/app/${newChat.id}`)
            router.refresh()
        } catch (error) {
            console.error('Failed to create chat', error)
        }
    }

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <div className="flex flex-col h-full border-r bg-muted/10">
            <div className="p-4 h-14 flex items-center border-b">
                <Button
                    onClick={handleNewChat}
                    className="w-full justify-start gap-2"
                    variant="default"
                >
                    <Plus className="h-4 w-4" />
                    New Chat
                </Button>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-2 gap-2 flex flex-col">
                    {chats.map((chat) => (
                        <div key={chat.id} className="group relative flex items-center">
                            <Link
                                href={`/app/${chat.id}`}
                                className={cn(
                                    "flex-1 flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground pr-8",
                                    pathname === `/app/${chat.id}` ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                                )}
                            >
                                <MessageSquare className="h-4 w-4 shrink-0" />
                                <span className="truncate">{chat.title || 'Untitled Chat'}</span>
                            </Link>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                onClick={async (e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    if (!confirm('Delete this chat?')) return

                                    try {
                                        await ChatService.deleteChat(chat.id)
                                        setChats(chats.filter(c => c.id !== chat.id))
                                        if (pathname === `/app/${chat.id}`) {
                                            router.push('/app')
                                        }
                                        router.refresh()
                                    } catch (err) {
                                        console.error('Failed to delete chat', err)
                                    }
                                }}
                            >
                                <LogOut className="h-3 w-3" />
                            </Button>
                        </div>
                    ))}
                    {chats.length === 0 && (
                        <div className="text-center text-muted-foreground text-xs py-8">
                            No chats yet. Start one!
                        </div>
                    )}
                </div>
            </ScrollArea>

            <div className="p-4 border-t mt-auto">
                <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={user?.user_metadata?.avatar_url} />
                        <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-medium truncate">{user?.email}</span>
                        <span className="text-xs text-muted-foreground truncate">Free Plan</span>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 text-muted-foreground"
                    onClick={handleSignOut}
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </Button>
            </div>
        </div>
    )
}
