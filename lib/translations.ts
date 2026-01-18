export type Language = 'en' | 'de'

export const translations = {
    en: {
        // Sidebar
        newChat: 'New Chat',
        untitledChat: 'Untitled Chat',
        deleteChatConfirm: 'Delete?',
        yes: 'Yes',
        no: 'No',
        noChatsYet: 'No chats yet. Start one!',
        signOut: 'Sign Out',

        // Auth
        welcomeTitle: 'Welcome to BAföG Bot',
        joinTitle: 'Join BAföG Bot',
        resetTitle: 'Reset Password',
        magicLinkTitle: 'Sign in with Magic Link',

        signinSubtitle: 'Sign in to get instant answers to your BAföG questions.',
        signupSubtitle: 'Create a free account to start your BAföG consultation.',
        forgotSubtitle: "Enter your email and we'll send you a reset link.",
        magicLinkSubtitle: "We'll send you a link to sign in instantly.",

        signinBtn: 'Sign In',
        signupBtn: 'Sign Up',
        sendResetBtn: 'Send Reset Link',
        sendMagicBtn: 'Send Magic Link',

        magicLinkOption: 'Sign in with Magic Link',
        forgotPassword: 'Forgot your password?',
        backToSignIn: 'Back to Sign In',
        noAccount: "Don't have an account? Sign Up",
        hasAccount: "Already have an account? Sign In",

        emailPlaceholder: 'name@example.com',
        passwordPlaceholder: 'Password',

        successMagicLink: 'Check your email for a magic sign-in link!',
        successResetLink: 'Check your email for a password reset link.',
        successSignup: 'Check your email to confirm your account.',

        // App Index
        welcomeApp: 'Welcome to BAföG Bot',
        selectChat: 'Select a chat from the sidebar or start a new conversation to ask your BAföG questions.',

        // Chat Interface
        greeting: "Hallo! I'm your BAföG assistant 👋",
        greetingSub: "Ask me anything about BAföG — eligibility, application process, documents, deadlines, or repayment. I speak multiple languages!",
        inputPlaceholder: "Ask about BAföG...",
        aiDisclaimer: "AI can make mistakes. Please verify important information.",
        viewReasoning: "View agent reasoning",
        toolsUsed: "tool(s) used",
        generatedIn: "Generated in",
        phases: [
            "Thinking",
            "Searching BAföG database",
            "Analyzing information",
            "Generating response"
        ],

        // Accessibility
        accessibilityTitle: "Accessibility Settings",
        appearance: "Appearance",
        textSize: "Text Size",
        languageMode: "Language Mode",
        simpleLanguage: "Simple Language",
        simpleLanguageDesc: "Simplifies answers for better readability.",

        // Incognito Mode
        tryWithoutAccount: "Try without account",
        incognitoBanner: "You're in incognito mode. Your chat will disappear when you close this tab.",
        signUpToSave: "Sign up to save",

        // Upload Disclaimer
        uploadInfo: "File Upload Info",
        uploadDisclaimer: "• One file at a time (max 5MB)\n• Supported: PNG, JPG, WebP, PDF\n• Text PDFs: Full text extracted instantly\n• Scanned/image PDFs: First 5 pages processed via OCR (slower)\n\nTip: Use standard text PDFs for best results!",

        // Footer
        privacyPolicy: "Privacy Policy",
        impressum: "Legal Notice"
    },
    de: {
        // Sidebar
        newChat: 'Neuer Chat',
        untitledChat: 'Unbenannter Chat',
        deleteChatConfirm: 'Löschen?',
        yes: 'Ja',
        no: 'Nein',
        noChatsYet: 'Noch keine Chats. Starte einen!',
        signOut: 'Abmelden',

        // Auth
        welcomeTitle: 'Willkommen beim BAföG Bot',
        joinTitle: 'Registrieren',
        resetTitle: 'Passwort zurücksetzen',
        magicLinkTitle: 'Mit Magic Link anmelden',

        signinSubtitle: 'Melde dich an für sofortige Antworten auf deine BAföG-Fragen.',
        signupSubtitle: 'Erstelle ein kostenloses Konto für deine BAföG-Beratung.',
        forgotSubtitle: 'Gib deine E-Mail ein und wir senden dir einen Link zum Zurücksetzen.',
        magicLinkSubtitle: 'Wir senden dir einen Link zur sofortigen Anmeldung.',

        signinBtn: 'Anmelden',
        signupBtn: 'Registrieren',
        sendResetBtn: 'Link senden',
        sendMagicBtn: 'Magic Link senden',

        magicLinkOption: 'Mit Magic Link anmelden',
        forgotPassword: 'Passwort vergessen?',
        backToSignIn: 'Zurück zur Anmeldung',
        noAccount: 'Kein Konto? Registrieren',
        hasAccount: 'Bereits registriert? Anmelden',

        emailPlaceholder: 'name@beispiel.de',
        passwordPlaceholder: 'Passwort',

        successMagicLink: 'Prüfe deine E-Mails für den Anmelde-Link!',
        successResetLink: 'Prüfe deine E-Mails für den Reset-Link.',
        successSignup: 'Prüfe deine E-Mails zur Bestätigung.',

        // App Index
        welcomeApp: 'Willkommen beim BAföG Bot',
        selectChat: 'Wähle einen Chat aus der Seitenleiste oder starte eine neue Konversation für deine BAföG-Fragen.',

        // Chat Interface
        greeting: "Hallo! Ich bin dein BAföG-Assistent 👋",
        greetingSub: "Frag mich alles zum Thema BAföG — Berechtigung, Antrag, Dokumente, Fristen oder Rückzahlung.",
        inputPlaceholder: "Frag etwas über BAföG...",
        aiDisclaimer: "KI kann Fehler machen. Bitte überprüfe wichtige Informationen.",
        viewReasoning: "Agenten-Logik anzeigen",
        toolsUsed: "Tool(s) verwendet",
        generatedIn: "Generiert in",
        phases: [
            "Denke nach",
            "Durchsuche BAföG-Datenbank",
            "Analysiere Informationen",
            "Generiere Antwort"
        ],

        // Accessibility
        accessibilityTitle: "Barrierefreiheit Einstellungen",
        appearance: "Erscheinungsbild",
        textSize: "Textgröße",
        languageMode: "Sprachmodus",
        simpleLanguage: "Leichte Sprache",
        simpleLanguageDesc: "Vereinfacht Antworten für bessere Lesbarkeit.",

        // Incognito Mode
        tryWithoutAccount: "Ohne Konto testen",
        incognitoBanner: "Du bist im Inkognito-Modus. Dein Chat verschwindet, wenn du diesen Tab schließt.",
        signUpToSave: "Registrieren zum Speichern",

        // Upload Disclaimer
        uploadInfo: "Datei-Upload Info",
        uploadDisclaimer: "• Eine Datei gleichzeitig (max. 5MB)\n• Unterstützt: PNG, JPG, WebP, PDF\n• Text-PDFs: Text wird sofort extrahiert\n• Gescannte PDFs: Erste 5 Seiten per OCR verarbeitet (langsamer)\n\nTipp: Verwende Standard-Text-PDFs für beste Ergebnisse!",

        // Footer
        privacyPolicy: "Datenschutzerklärung",
        impressum: "Impressum"
    }
}

export type TranslationKey = keyof typeof translations.en
