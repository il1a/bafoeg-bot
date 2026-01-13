'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Plus, MessageSquare, LogOut, Trash2, Pencil, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatService } from '@/services/chatService'
import { Database } from '@/types/supabase'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ThemeToggle } from '@/components/theme-toggle'

type Chat = Database['public']['Tables']['chats']['Row']

interface SidebarProps {
    initialChats?: Chat[]
    user?: any
}

export function Sidebar({ initialChats = [], user }: SidebarProps) {
    const [chats, setChats] = useState<Chat[]>(initialChats)
    const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null)
    const [editingChatId, setEditingChatId] = useState<string | null>(null)
    const [editTitle, setEditTitle] = useState('')
    const editInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()
    const pathname = usePathname()
    const supabase = createClient()

    useEffect(() => {
        setChats(initialChats)
    }, [initialChats])

    useEffect(() => {
        if (editingChatId && editInputRef.current) {
            editInputRef.current.focus()
            editInputRef.current.select()
        }
    }, [editingChatId])

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

    const handleDeleteChat = async (chatId: string) => {
        try {
            await ChatService.deleteChat(chatId)
            setChats(chats.filter(c => c.id !== chatId))
            setConfirmingDeleteId(null)
            if (pathname === `/app/${chatId}`) {
                router.push('/app')
            }
            router.refresh()
        } catch (err) {
            console.error('Failed to delete chat', err)
        }
    }

    const handleRenameChat = async (chatId: string) => {
        const trimmed = editTitle.trim()
        if (!trimmed) {
            setEditingChatId(null)
            return
        }
        try {
            await ChatService.updateChatTitle(chatId, trimmed)
            setChats(chats.map(c => c.id === chatId ? { ...c, title: trimmed } : c))
            setEditingChatId(null)
            router.refresh()
        } catch (err) {
            console.error('Failed to rename chat', err)
        }
    }

    const startEditing = (chat: Chat) => {
        setEditingChatId(chat.id)
        setEditTitle(chat.title || '')
        setConfirmingDeleteId(null)
    }

    const cancelEditing = () => {
        setEditingChatId(null)
        setEditTitle('')
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
                        <div key={chat.id} className="flex flex-col">
                            {/* Main chat row */}
                            <div className="group relative flex items-center">
                                {editingChatId === chat.id ? (
                                    /* Inline rename input */
                                    <div className="flex-1 flex items-center gap-2 px-3 py-2">
                                        <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                                        <input
                                            ref={editInputRef}
                                            type="text"
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleRenameChat(chat.id)
                                                } else if (e.key === 'Escape') {
                                                    cancelEditing()
                                                }
                                            }}
                                            className="flex-1 text-sm bg-transparent border-b border-primary focus:outline-none"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-green-500 hover:text-green-600 hover:bg-green-500/10"
                                            onClick={() => handleRenameChat(chat.id)}
                                        >
                                            <Check className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                            onClick={cancelEditing}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ) : (
                                    /* Normal chat row with action buttons */
                                    <div
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer",
                                            pathname === `/app/${chat.id}` ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                                        )}
                                        onClick={() => router.push(`/app/${chat.id}`)}
                                    >
                                        <MessageSquare className="h-4 w-4 shrink-0" />
                                        <span className="flex-1 truncate min-w-0">{chat.title || 'Untitled Chat'}</span>

                                        {/* Action buttons - visible on hover */}
                                        <div className="flex items-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                            {/* Rename button */}
                                            <button
                                                type="button"
                                                className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-green-500 hover:bg-green-500/10"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    startEditing(chat)
                                                }}
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </button>
                                            {/* Delete button */}
                                            <button
                                                type="button"
                                                className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setConfirmingDeleteId(chat.id)
                                                    setEditingChatId(null)
                                                }}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {confirmingDeleteId === chat.id && (
                                <div className="flex items-center gap-1 px-3 py-1.5 bg-destructive/10 rounded-md mt-1 text-sm">
                                    <span className="text-muted-foreground text-xs shrink-0">Delete?</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-5 px-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                        onClick={() => handleDeleteChat(chat.id)}
                                    >
                                        Yes
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-5 px-2 text-xs text-muted-foreground hover:text-foreground"
                                        onClick={() => setConfirmingDeleteId(null)}
                                    >
                                        No
                                    </Button>
                                </div>
                            )}

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
                    <div className="flex flex-col overflow-hidden flex-1">
                        <span className="text-sm font-medium truncate">{user?.email}</span>
                        <span className="text-xs text-muted-foreground truncate">Free Plan</span>
                    </div>
                    <ThemeToggle />
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
