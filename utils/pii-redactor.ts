/**
 * PII Redaction Utility for DSGVO Compliance
 * 
 * Redacts personally identifiable information from user messages
 * before forwarding to external services (n8n, OpenAI, etc.)
 * 
 * MIT License - University of Potsdam BAföG Bot
 */

export interface RedactionResult {
    redactedText: string
    redactedItems: RedactedItem[]
    hasRedactions: boolean
}

export interface RedactedItem {
    type: PIIType
    original: string
    placeholder: string
    startIndex: number
    endIndex: number
}

export type PIIType =
    | 'EMAIL'
    | 'PHONE'
    | 'IBAN'
    | 'CREDIT_CARD'
    | 'GERMAN_ID'
    | 'PASSPORT'
    | 'TAX_ID'
    | 'SOCIAL_SECURITY'
    | 'DATE_OF_BIRTH'
    | 'ADDRESS'
    | 'POSTAL_CODE'
    | 'NAME'

interface PIIPattern {
    type: PIIType
    pattern: RegExp
    placeholder: string
}

/**
 * German-focused PII patterns for DSGVO compliance
 * Designed to catch common German identifier formats
 */
const PII_PATTERNS: PIIPattern[] = [
    // Email addresses
    {
        type: 'EMAIL',
        pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
        placeholder: '[E-MAIL]'
    },

    // German phone numbers (various formats)
    // Matches: +49 123 456789, 0049-123-456789, 0123 456789, 0123/456789
    {
        type: 'PHONE',
        pattern: /(?:\+49|0049|0)[\s./-]?(?:\(?\d{2,5}\)?[\s./-]?)?\d{3,}[\s./-]?\d{2,}/gi,
        placeholder: '[TELEFON]'
    },

    // IBAN (German and international)
    // DE89 3704 0044 0532 0130 00 or DE89370400440532013000
    {
        type: 'IBAN',
        pattern: /[A-Z]{2}\d{2}[\s]?(?:\d{4}[\s]?){4,7}\d{0,2}/gi,
        placeholder: '[IBAN]'
    },

    // Credit card numbers (with or without spaces/dashes)
    {
        type: 'CREDIT_CARD',
        pattern: /(?:\d{4}[\s-]?){3}\d{4}/g,
        placeholder: '[KREDITKARTE]'
    },

    // German ID card number (Personalausweis) - 9-10 alphanumeric
    {
        type: 'GERMAN_ID',
        pattern: /\b[A-Z0-9]{9,10}\b(?=.*(?:perso|ausweis|id))/gi,
        placeholder: '[AUSWEIS-NR]'
    },

    // German passport number
    {
        type: 'PASSPORT',
        pattern: /\b[CFGHJKLMNPRTVWXYZ][0-9]{8}\b/gi,
        placeholder: '[REISEPASS-NR]'
    },

    // German Tax ID (Steuer-ID) - 11 digits
    {
        type: 'TAX_ID',
        pattern: /\b\d{11}\b(?=.*(?:steuer|tax|id))/gi,
        placeholder: '[STEUER-ID]'
    },

    // German Social Security Number (Sozialversicherungsnummer) - 12 chars
    {
        type: 'SOCIAL_SECURITY',
        pattern: /\b\d{2}[A-Z]\d{6}[A-Z]\d{3}\b/gi,
        placeholder: '[SOZIALVERSICHERUNGS-NR]'
    },

    // Dates that look like birthdates (DD.MM.YYYY, DD/MM/YYYY, DD-MM-YYYY)
    // Only redact when in context of "geboren", "Geburtsdatum", "birth", etc.
    {
        type: 'DATE_OF_BIRTH',
        pattern: /(?:geboren|geburtsdatum|birth|geb\.?)[\s:]*(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})/gi,
        placeholder: '[GEBURTSDATUM]'
    },

    // German postal codes (5 digits, often with city)
    {
        type: 'POSTAL_CODE',
        pattern: /\b\d{5}\s+[A-ZÄÖÜ][a-zäöüß]+(?:\s+[A-ZÄÖÜ][a-zäöüß]+)?\b/g,
        placeholder: '[PLZ/ORT]'
    },

    // Street addresses (German format: Straße + number)
    {
        type: 'ADDRESS',
        pattern: /\b[A-ZÄÖÜ][a-zäöüß]+(?:straße|str\.|weg|platz|allee|ring|gasse|damm)\s*\d+[a-z]?\b/gi,
        placeholder: '[ADRESSE]'
    }
]

/**
 * Common name patterns (first name + last name) - ENGLISH and GERMAN
 * Catches "my name is X Y", "mein Name ist X Y", "I am X Y", etc.
 * Also catches signatures like "Best, [Name]"
 */
const NAME_CONTEXT_PATTERNS: RegExp[] = [
    // German patterns (Introduction)
    /(?:(?:mein|ich\s+bin|name\s+ist|heisse|heiße|ich\s+heiße)\s+)([A-ZÄÖÜ][a-zäöüß]+(?:\s+(?!(?:und|oder|aber|denn)\b)[A-ZÄÖÜ][a-zäöüß-]+)?)/gi,

    // English patterns (Introduction)
    /(?:(?:my\s+name\s+is|i\s+am|i'm|call\s+me|this\s+is)\s+)([A-ZÄÖÜ][a-zäöüß]+(?:\s+(?!(?:and|or|but|then)\b)[A-ZÄÖÜ][a-zäöüß-]+)?)/gi,

    // Direct introduction patterns
    // Matches "Name: [Name]" but avoids "Name is [Name]" (which is covered by other patterns) to prevent "is" capturing
    /(?:(?:name|Namen?)[\s:]+(?!(?:is|ist|sind|are|was|war|has|hat)\b))([A-ZÄÖÜ][a-zäöüß]+(?:\s+(?!(?:und|oder|and|or)\b)[A-ZÄÖÜ][a-zäöüß-]+)?)/gi,

    // Signatures (German & English)
    // Matches: "Best, [Name]", "Greetings, [Name]", "Viele Grüße, [Name]", "LG [Name]"
    // Requires a newline or start of string before the closing phrase to avoid false positives in mid-sentence
    /(?:(?:^|\n|[\.,!?]\s+)(?:best|regards|sincerely|yours|cheers|greetings|viele\s+grüße|mit\s+freundlichen\s+grüßen|liebe\s+grüße|lg|vg|mfg)[\s,]+)([A-ZÄÖÜ][a-zäöüß]+(?:\s+(?!(?:und|oder|and|or)\b)[A-ZÄÖÜ][a-zäöüß-]+)?)/gi
]

/**
 * Redacts PII from text using regex patterns
 * 
 * @param text - The input text to scan for PII
 * @returns RedactionResult with redacted text and metadata
 */
export function redactPII(text: string): RedactionResult {
    if (!text || typeof text !== 'string') {
        return {
            redactedText: text || '',
            redactedItems: [],
            hasRedactions: false
        }
    }

    const redactedItems: RedactedItem[] = []
    let workingText = text

    // Track positions for accurate indexing
    let offset = 0

    // Process each PII pattern
    for (const { type, pattern, placeholder } of PII_PATTERNS) {
        // Reset regex state
        pattern.lastIndex = 0

        let match: RegExpExecArray | null
        const newPattern = new RegExp(pattern.source, pattern.flags)

        while ((match = newPattern.exec(workingText)) !== null) {
            const original = match[0]
            const startIndex = match.index
            const endIndex = startIndex + original.length

            redactedItems.push({
                type,
                original,
                placeholder,
                startIndex: startIndex + offset,
                endIndex: endIndex + offset
            })

            // Replace in working text
            workingText = workingText.slice(0, startIndex) + placeholder + workingText.slice(endIndex)

            // Adjust offset and reset pattern
            offset += placeholder.length - original.length
            newPattern.lastIndex = startIndex + placeholder.length
        }
    }

    // Handle name patterns with context (multiple patterns for EN/DE support)
    for (const patternSource of NAME_CONTEXT_PATTERNS) {
        const namePattern = new RegExp(patternSource.source, patternSource.flags)
        let nameMatch: RegExpExecArray | null

        while ((nameMatch = namePattern.exec(workingText)) !== null) {
            if (nameMatch[1]) {
                const name = nameMatch[1]
                const fullMatch = nameMatch[0]
                const nameStartInMatch = fullMatch.indexOf(name)
                const startIndex = nameMatch.index + nameStartInMatch
                const endIndex = startIndex + name.length
                const placeholder = '[NAME]'

                redactedItems.push({
                    type: 'NAME',
                    original: name,
                    placeholder,
                    startIndex: startIndex + offset,
                    endIndex: endIndex + offset
                })

                workingText = workingText.slice(0, startIndex) + placeholder + workingText.slice(endIndex)
                offset += placeholder.length - name.length
                namePattern.lastIndex = startIndex + placeholder.length
            }
        }
    }

    return {
        redactedText: workingText,
        redactedItems,
        hasRedactions: redactedItems.length > 0
    }
}

/**
 * Logs redaction activity for audit purposes (DSGVO compliance)
 * Does NOT log the actual PII values, only metadata
 */
export function logRedactionAudit(
    sessionId: string,
    result: RedactionResult
): void {
    if (!result.hasRedactions) return

    const auditEntry = {
        timestamp: new Date().toISOString(),
        sessionId: sessionId.substring(0, 8) + '...', // Truncate for privacy
        redactionCount: result.redactedItems.length,
        types: [...new Set(result.redactedItems.map(item => item.type))]
    }

    console.log('[PII Redaction Audit]', JSON.stringify(auditEntry))
}
