// Minimum characters per page to consider extraction successful
const MIN_CHARS_PER_PAGE = 50

export interface PdfExtractionResult {
    text: string
    success: boolean
    pageCount: number
    averageCharsPerPage: number
}

/**
 * Extracts text from a PDF file using pdf.js
 * Returns extracted text and a flag indicating if extraction was successful
 * 
 * Success is determined by having meaningful text content (> MIN_CHARS_PER_PAGE average)
 * If the PDF is scanned/image-based, success will be false
 */
export async function extractPdfText(file: File): Promise<PdfExtractionResult> {
    // Only run in browser environment
    if (typeof window === 'undefined') {
        return {
            text: '',
            success: false,
            pageCount: 0,
            averageCharsPerPage: 0
        }
    }

    try {
        // Dynamic import to avoid SSR issues with pdfjs-dist
        const pdfjsLib = await import('pdfjs-dist')

        // Use unpkg CDN which has the correct build files
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

        let fullText = ''
        const pageCount = pdf.numPages

        // Limit to first 10 pages to avoid huge extraction
        const maxPages = Math.min(pageCount, 10)

        for (let i = 1; i <= maxPages; i++) {
            const page = await pdf.getPage(i)
            const content = await page.getTextContent()
            const pageText = content.items
                .map((item: any) => item.str)
                .join(' ')
                .trim()

            if (pageText) {
                fullText += pageText + '\n\n'
            }
        }

        fullText = fullText.trim()

        // Limit total text to 8000 chars (~2000 tokens)
        if (fullText.length > 8000) {
            fullText = fullText.substring(0, 8000) + '\n\n[... truncated for brevity ...]'
        }

        const averageCharsPerPage = maxPages > 0 ? fullText.length / maxPages : 0

        // Consider extraction successful if we have meaningful text
        const success = averageCharsPerPage >= MIN_CHARS_PER_PAGE

        console.log(`[PDF] Extraction complete: ${pageCount} pages (processed ${maxPages}), ${fullText.length} chars, success: ${success}`)

        return {
            text: fullText,
            success,
            pageCount,
            averageCharsPerPage
        }
    } catch (error) {
        console.error('[PDF Extraction] Failed to extract text:', error)
        return {
            text: '',
            success: false,
            pageCount: 0,
            averageCharsPerPage: 0
        }
    }
}

/**
 * Checks if a file is a PDF based on MIME type
 */
export function isPdf(mimeType: string): boolean {
    return mimeType === 'application/pdf'
}
