import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

interface MarkdownRendererProps {
    content: string
    className?: string
}

export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
    return (
        <div className={cn("prose prose-sm dark:prose-invert max-w-none break-words", className)}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // Customize components if needed (e.g. code blocks, links)
                    code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '')
                        return !inline && match ? (
                            <div className="rounded-md bg-muted p-2 my-2 overflow-x-auto">
                                <code className={className} {...props}>
                                    {children}
                                </code>
                            </div>
                        ) : (
                            <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono" {...props}>
                                {children}
                            </code>
                        )
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
                {content}
            </ReactMarkdown>
        </div>
    )
}
