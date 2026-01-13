import React, { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'
import { FileText } from 'lucide-react'

interface MarkdownRendererProps {
    content: string
    className?: string
}

interface SourceInfo {
    name: string
    url?: string
}

interface ParsedContent {
    mainContent: string
    sources: SourceInfo[]
}

// Parse content to extract sources section
function parseContent(content: string): ParsedContent {
    // Match "Sources:" followed by source names (could be on same line or next lines)
    const sourcesMatch = content.match(/\*?\*?Sources:\*?\*?\s*([\s\S]*?)$/i)

    if (!sourcesMatch) {
        return { mainContent: content, sources: [] }
    }

    const mainContent = content.substring(0, sourcesMatch.index).trim()
    const sourcesText = sourcesMatch[1].trim()

    // Extract individual sources - they could be:
    // - On separate lines
    // - As markdown links [name](url)
    // - Just plain text names
    const sources: SourceInfo[] = []

    // Split by newlines and process each line
    const lines = sourcesText.split('\n').filter(line => line.trim())

    for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed) continue

        // Check if it's a markdown link [name](url)
        const linkMatch = trimmed.match(/\[([^\]]+)\]\(([^)]+)\)/)
        if (linkMatch) {
            sources.push({ name: linkMatch[1], url: linkMatch[2] })
        } else {
            // Plain text source name (no URL)
            sources.push({ name: trimmed })
        }
    }

    return { mainContent, sources }
}

// Clean up source name for display
function cleanSourceName(name: string): string {
    return name
        .replace(/[-_]/g, ' ')  // Replace dashes and underscores with spaces
        .replace(/\s+/g, ' ')   // Normalize multiple spaces
        .trim()
}

// Source bubble component
function SourceBubble({ source }: { source: SourceInfo }) {
    const displayName = cleanSourceName(source.name)

    const bubbleContent = (
        <>
            <FileText className="h-3 w-3 text-muted-foreground" />
            {displayName}
        </>
    )

    const baseClasses = "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/80 border border-border/50 text-xs font-medium text-foreground/90 transition-colors"

    if (source.url) {
        return (
            <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${baseClasses} hover:bg-primary/20 hover:border-primary/50 cursor-pointer`}
            >
                {bubbleContent}
            </a>
        )
    }

    return (
        <span className={`${baseClasses} hover:bg-muted`}>
            {bubbleContent}
        </span>
    )
}

export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
    const { mainContent, sources } = useMemo(() => parseContent(content), [content])

    return (
        <div className={cn("space-y-4", className)}>
            {/* Main content with improved prose spacing */}
            <div className="prose prose-sm dark:prose-invert max-w-none break-words prose-p:my-3 prose-headings:mt-5 prose-headings:mb-3 prose-ul:my-3 prose-ol:my-3 prose-li:my-1 prose-strong:text-foreground">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        // Customize components if needed (e.g. code blocks, links)
                        code({ node, inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '')
                            return !inline && match ? (
                                <div className="rounded-md bg-muted p-3 my-3 overflow-x-auto">
                                    <code className={className} {...props}>
                                        {children}
                                    </code>
                                </div>
                            ) : (
                                <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                                    {children}
                                </code>
                            )
                        },
                        p({ children }) {
                            return <p className="leading-relaxed">{children}</p>
                        },
                        ul({ children }) {
                            return <ul className="space-y-2 list-disc pl-4">{children}</ul>
                        },
                        ol({ children }) {
                            return <ol className="space-y-2 list-decimal pl-4">{children}</ol>
                        },
                        table({ children }) {
                            return (
                                <div className="overflow-x-auto my-4">
                                    <table className="min-w-full divide-y divide-border border">
                                        {children}
                                    </table>
                                </div>
                            )
                        },
                        th({ children }) {
                            return <th className="bg-muted px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">{children}</th>
                        },
                        td({ children }) {
                            return <td className="px-3 py-2 whitespace-normal text-sm border-t border-border">{children}</td>
                        },
                        a({ children, href }) {
                            return (
                                <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                                    {children}
                                </a>
                            )
                        }
                    }}
                >
                    {mainContent}
                </ReactMarkdown>
            </div>

            {/* Sources section as bubbles */}
            {sources.length > 0 && (
                <div className="pt-3 border-t border-border/40">
                    <div className="text-xs font-medium text-muted-foreground mb-2">Sources</div>
                    <div className="flex flex-wrap gap-2">
                        {sources.map((source, idx) => (
                            <SourceBubble key={idx} source={source} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
