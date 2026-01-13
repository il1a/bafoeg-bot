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
    // Find all occurrences of "Sources", "Quellen" (case insensitive)
    // We strictly look for them at the start of a line (ignoring whitespace).
    // The regex is permissive about markdown decoration (*, #) and colons.
    // Matches:
    // - Sources:
    // - **Sources**
    // - **Sources:**
    // - ## Quellen
    // - Quellen:
    const markerRegex = /(?:^|\n)\s*[\#*]*\s*(?:Sources|Quellen)[\s:*#]*\s*(?:\n|$)/gi
    const matches = [...content.matchAll(markerRegex)]

    if (matches.length === 0) {
        return { mainContent: content, sources: [] }
    }

    // Take the last match
    const lastMatch = matches[matches.length - 1]

    if (lastMatch.index === undefined) {
        return { mainContent: content, sources: [] }
    }

    const mainContent = content.substring(0, lastMatch.index).trim()
    const sourcesText = content.substring(lastMatch.index + lastMatch[0].length).trim()

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
            // Cleanup bullets if present
            const cleanName = trimmed.replace(/^[-*•]\s+/, '')
            sources.push({ name: cleanName })
        }
    }

    return { mainContent, sources }
}

// Clean up source name for display
function cleanSourceName(name: string): string {
    let clean = name

    // 1. Decode URI if needed
    if (clean.includes('%')) {
        try { clean = decodeURIComponent(clean) } catch (e) { }
    }

    // 2. Remove common file extensions
    clean = clean.replace(/\.(html|htm|php|pdf|aspx|jsp)$/i, '')

    // 3. Replace separators:
    // - Standard hyphen (-) and underscore (_)
    // - Unicode dashes (U+2010 to U+2015, includes en-dash, em-dash, horizontal bar)
    // - Non-breaking hyphen (U+2011) explicitly just in case
    clean = clean.replace(/[-_\u2010-\u2015]/g, ' ')

    // 4. Normalize spaces
    clean = clean.replace(/\s+/g, ' ').trim()

    // 5. Title Case (Capitalize first letter of each word)
    return clean.split(' ').map(word => {
        // Skip small words if desired, or just capitalize all
        if (!word) return ''
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    }).join(' ')
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
