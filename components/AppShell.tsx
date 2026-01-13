'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { PanelLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

interface AppShellProps {
    children: React.ReactNode
    sidebar: React.ReactNode
}

export function AppShell({ children, sidebar }: AppShellProps) {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true)
    const [isMobileOpen, setIsMobileOpen] = React.useState(false)
    const pathname = usePathname()

    React.useEffect(() => {
        setIsMobileOpen(false)
    }, [pathname])

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden">
            {/* Mobile Sidebar (Sheet) */}
            <div className="md:hidden">
                <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                    <SheetContent side="left" className="p-0 w-[80%] max-w-[320px] border-r-0">
                        <VisuallyHidden>
                            <SheetTitle>Navigation Menu</SheetTitle>
                            <SheetDescription>
                                Main navigation sidebar for accessing chats and settings.
                            </SheetDescription>
                        </VisuallyHidden>
                        {sidebar}
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Sidebar (Collapsible) */}
            <aside
                className={cn(
                    "hidden md:flex flex-col border-r transition-all duration-300 ease-in-out relative h-full",
                    isSidebarOpen ? "w-[280px]" : "w-[0px] border-r-0 overflow-hidden"
                )}
            >
                <div className="h-full w-[280px] overflow-hidden">
                    {sidebar}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full relative min-w-0 transition-all duration-300 ease-in-out">
                {/* Mobile Header / Trigger */}
                <div className="md:hidden flex items-center p-4 border-b h-14 shrink-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMobileOpen(true)}
                        className="-ml-2"
                    >
                        <PanelLeft className="h-5 w-5" />
                        <span className="sr-only">Open Menu</span>
                    </Button>
                    <span className="font-semibold ml-2">BAföG Bot</span>
                </div>

                {/* Desktop Toggle Button */}
                <div className="hidden md:block absolute left-4 top-4 z-50">
                    {!isSidebarOpen && (
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setIsSidebarOpen(true)}
                            className="h-8 w-8 rounded-full shadow-md bg-background hover:bg-muted"
                        >
                            <ChevronRight className="h-4 w-4" />
                            <span className="sr-only">Expand Sidebar</span>
                        </Button>
                    )}
                </div>

                {/* Desktop Toggle Button (Inside Sidebar relative) or Floating near edge when open */}
                <div
                    className={cn(
                        "hidden md:flex absolute top-1/2 -translate-y-1/2 z-50 transition-all duration-300 ease-in-out",
                        isSidebarOpen ? "left-0 -ml-4" : "-left-10" // Hide when closed, as we use the other button
                    )}
                >
                    {isSidebarOpen && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsSidebarOpen(false)}
                            className="h-8 w-8 rounded-full border bg-background shadow-sm hover:bg-muted text-muted-foreground"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            <span className="sr-only">Collapse Sidebar</span>
                        </Button>
                    )}
                </div>

                <div className="flex-1 overflow-hidden relative w-full h-full">
                    {children}
                </div>
            </main>
        </div>
    )
}
