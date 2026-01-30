import React, { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'
import { FileText, Scale, Globe } from 'lucide-react'

interface MarkdownRendererProps {
    content: string
    className?: string
}

interface SourceInfo {
    name: string
    url?: string
    type?: 'webpage' | 'law'
}

interface ParsedContent {
    mainContent: string
    sources: SourceInfo[]
}

// Check source type based on URL or name
function determineSourceType(name: string, url?: string): 'webpage' | 'law' {
    const lowerUrl = url?.toLowerCase() || ''
    const lowerName = name.toLowerCase()

    // Law detection heuristics
    if (
        lowerUrl.includes('gesetze-im-internet.de') ||
        lowerUrl.includes('buzer.de') ||
        lowerName.includes('§') ||
        lowerName.includes('bafög') && lowerName.includes('gesetz') ||
        lowerName.match(/paragraph|absatz|satz/i)
    ) {
        return 'law'
    }

    return 'webpage'
}

// Parse content to extract sources section
function parseContent(content: string): ParsedContent {
    let mainContent = content
    const sources: SourceInfo[] = []

    // 1. Extract inline citations format: 【source_name:"Name"】(URL)
    // We use a replacement function to remove them from main content while collecting them
    const inlineCitationRegex = /【source_name:"([^"]+)"】\(([^)]+)\)/g

    mainContent = mainContent.replace(inlineCitationRegex, (match, name, url) => {
        sources.push({
            name: name,
            url: url,
            type: determineSourceType(name, url)
        })
        return '' // Remove from text
    })

    // 2. Handle legacy "Sources:" block at the end
    // Find all occurrences of "Sources", "Quellen" (case insensitive) at start of line
    const markerRegex = /(?:^|\n)\s*[\#*]*\s*(?:Sources|Quellen)[\s:*#]*\s*(?:\n|$)/gi
    const matches = [...mainContent.matchAll(markerRegex)]

    // Only process if we found a marker
    if (matches.length > 0) {
        // Take the last match to split content
        const lastMatch = matches[matches.length - 1]

        if (lastMatch.index !== undefined) {
            const legacySourcesText = mainContent.substring(lastMatch.index + lastMatch[0].length).trim()

            // Update main content to exclude the legacy sources block
            mainContent = mainContent.substring(0, lastMatch.index).trim()

            // Parse existing sources from the block
            const lines = legacySourcesText.split('\n').filter(line => line.trim())

            for (const line of lines) {
                const trimmed = line.trim()
                if (!trimmed) continue

                // Check if it's a markdown link [name](url)
                const linkMatch = trimmed.match(/\[([^\]]+)\]\(([^)]+)\)/)
                if (linkMatch) {
                    const name = linkMatch[1]
                    const url = linkMatch[2]
                    sources.push({
                        name,
                        url,
                        type: determineSourceType(name, url)
                    })
                } else {
                    // Plain text source name
                    const cleanName = trimmed.replace(/^[-*•]\s+/, '')
                    sources.push({
                        name: cleanName,
                        type: determineSourceType(cleanName)
                    })
                }
            }
        }
    }

    // Deduplicate sources based on URL or Name
    const uniqueSources: SourceInfo[] = []
    const seen = new Set<string>()

    for (const source of sources) {
        const key = source.url || source.name
        if (!seen.has(key)) {
            seen.add(key)
            uniqueSources.push(source)
        }
    }

    return { mainContent, sources: uniqueSources }
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
    // - Unicode dashes (U+2010 to U+2015)
    clean = clean.replace(/[-_\u2010-\u2015]/g, ' ')

    // 4. Normalize spaces
    clean = clean.replace(/\s+/g, ' ').trim()

    // 5. Title Case (Capitalize first letter of each word)
    return clean.split(' ').map(word => {
        if (!word) return ''
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    }).join(' ')
}

// Source bubble component
function SourceBubble({ source }: { source: SourceInfo }) {
    const displayName = cleanSourceName(source.name)
    const isLaw = source.type === 'law'

    const BubbleIcon = isLaw ? Scale : Globe

    // Styles configuration
    // Law: Red/Rose theme
    // Webpage: Blue/Sky theme
    const colorClasses = isLaw
        ? "bg-rose-100/80 text-rose-800 border-rose-200 hover:bg-rose-100 hover:border-rose-300 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800"
        : "bg-blue-100/80 text-blue-800 border-blue-200 hover:bg-blue-100 hover:border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"

    const baseClasses = cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors duration-200",
        colorClasses
    )

    const bubbleContent = (
        <>
            <BubbleIcon className="h-3 w-3 opacity-70" />
            <span className="truncate max-w-[200px]">{displayName}</span>
        </>
    )

    if (source.url) {
        return (
            <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(baseClasses, "cursor-pointer hover:shadow-sm")}
            >
                {bubbleContent}
            </a>
        )
    }

    return (
        <span className={baseClasses}>
            {bubbleContent}
        </span>
    )
}

export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
    const { mainContent, sources } = useMemo(() => parseContent(content), [content])

    return (
        <div className={cn("space-y-4", className)}>
            {/* Main content */}
            <div className="prose prose-sm dark:prose-invert max-w-none break-words prose-p:my-3 prose-headings:mt-5 prose-headings:mb-3 prose-ul:my-3 prose-ol:my-3 prose-li:my-1 prose-strong:text-foreground">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
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
                                <div className="w-full overflow-x-auto my-4 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
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
                <div className="pt-4 border-t border-border/40 mt-2">
                    <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/70 mb-3 flex items-center gap-2">
                        <FileText className="h-3 w-3" />
                        Sources
                    </div>
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
