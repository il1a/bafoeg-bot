/**
 * Helper to clean model output
 * Removes functional "assistantfinal" markers (system tokens from n8n)
 * Removes citation tags like 【123】 or 【Text】
 * Preserves all visible markdown formatting including Antwort/Answer headers
 */
export function cleanModelOutput(rawOutput: string): string {
    if (!rawOutput) return ''
    let cleanedOutput = rawOutput

    // 1. Remove functional "assistantfinal" markers (system tokens)
    // These are internal markers from n8n, not visible to users
    const functionalMarkers = [
        /answer\.assistantfinal\s*/gi,
        /assistantfinal\s*/gi,
    ]

    for (const marker of functionalMarkers) {
        // Find all matches to select the last one (in case instructions echo these)
        const matches = [...cleanedOutput.matchAll(marker)]
        if (matches.length > 0) {
            const lastMatch = matches[matches.length - 1]
            if (lastMatch.index !== undefined) {
                cleanedOutput = cleanedOutput.substring(lastMatch.index + lastMatch[0].length).trim()
                break
            }
        }
    }

    // 2. Remove Citation Tags
    // Pattern: 【...】 (e.g. 【6391872200883317178】, 【Source】, etc.)
    // using non-greedy match .*? to handle multiple tags in one string without eating everything between them
    cleanedOutput = cleanedOutput.replace(/【.*?】/g, '')

    // 3. Chain of Thought Leakage Fix
    // If the output contains specific "Final Answer" markers that appear LATE in the text,
    // it suggests previous text was reasoning.
    // We look for "**Kurzantwort**" or "**Final Answer**".
    const finalAnswerMarkers = [
        /\*\*Kurzantwort\*\*:?/gi,
        /\*\*Final Answer\*\*:?/gi,
        /\*\*Fazit\*\*:?/gi,
        /\*\*Antwort\*\*:?/gi
    ]

    for (const marker of finalAnswerMarkers) {
        // Find all matches to select the last one
        const matches = [...cleanedOutput.matchAll(marker)]
        if (matches.length > 0) {
            const lastMatch = matches[matches.length - 1]
            // If we found a marker, we assume everything before it (if it's not the start) is reasoning.
            // We keep the marker itself as it provides context (e.g. "Kurzantwort: ...")
            if (lastMatch.index !== undefined && lastMatch.index > 0) {
                // Check if it's really "late" or just the start?
                // If it's index > 0, we treat it as a split.
                cleanedOutput = cleanedOutput.substring(lastMatch.index).trim()
                break
            }
        }
    }

    return cleanedOutput.trim()
}
