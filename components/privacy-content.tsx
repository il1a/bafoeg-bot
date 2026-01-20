'use client'

import { useLanguage } from '@/contexts/language-context'
import { CloseButton } from '@/components/close-button'

export function PrivacyContent() {
    const { language } = useLanguage()

    if (language === 'en') {
        return (
            <main className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8 relative">
                <CloseButton />
                <article className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert">
                    <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

                    <p className="text-sm text-muted-foreground mb-8">
                        Last updated: January 20, 2026
                    </p>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">1. Responsible Body</h2>
                        <p>
                            Responsible for data processing on this website is the research team of the project
                            "Design and Evaluation of an AI-Based Chatbot to Improve Information Access to BAföG Services"
                            at the University of Potsdam:
                        </p>
                        <address className="not-italic mt-4 text-sm leading-relaxed">
                            Bruk Asrat, Elisa Haxhillazi, Ilia Sokolovskiy, Lamia Islam, Osman Mohmmed, Paul Bakos
                            <br />
                            University of Potsdam
                            <br />
                            Am Neuen Palais 10
                            <br />
                            14469 Potsdam
                            <br />
                            Germany
                            <br />
                            <br />
                            Email:{" "}
                            <a
                                href="mailto:contact@bafoeg.ilia.work"
                                className="text-primary hover:underline"
                            >
                                contact@bafoeg.ilia.work
                            </a>
                        </address>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">
                            2. Collection and Storage of Personal Data
                        </h2>

                        <h3 className="text-lg font-medium mt-6 mb-2">
                            2.1 When Visiting the Website
                        </h3>
                        <p>
                            When accessing our website, the browser used on your device naturally sends information to
                            the server. This includes:
                        </p>
                        <ul className="list-disc pl-6 mt-2">
                            <li>IP address of the requesting computer</li>
                            <li>Date and time of access</li>
                            <li>Name and URL of the retrieved file</li>
                            <li>Website from which access is made (Referrer URL)</li>
                            <li>Browser used and, if applicable, the operating system of your computer</li>
                        </ul>
                        <p className="mt-4">
                            This data is analyzed solely to ensure the trouble-free operation of the website and to
                            improve our service. It is not possible for us to assign this data to a specific person.
                        </p>

                        <h3 className="text-lg font-medium mt-6 mb-2">
                            2.2 When Using the Chatbot (Registered Users)
                        </h3>
                        <p>
                            If you register and use the chatbot, we store the following data:
                        </p>
                        <ul className="list-disc pl-6 mt-2">
                            <li>Email address</li>
                            <li>Chat history (Questions and Answers)</li>
                        </ul>
                        <p className="mt-4">
                            This data is stored to provide you with a personalized service and to make previous
                            conversations accessible. The legal basis is Art. 6 Para. 1 lit. b GDPR (Performance of Contract).
                        </p>

                        <h3 className="text-lg font-medium mt-6 mb-2">
                            2.3 When Using Incognito Mode
                        </h3>
                        <p>
                            In Incognito Mode, no personal data is permanently stored. All chat data is kept strictly
                            temporarily in your browser and is deleted when the session is closed.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">
                            3. Processors and Third Countries
                        </h2>

                        <h3 className="text-lg font-medium mt-6 mb-2">3.1 Supabase</h3>
                        <p>
                            We use Supabase Inc. (USA) as a database and authentication provider. Supabase processes
                            data in accordance with EU Standard Contractual Clauses. More information:{" "}
                            <a
                                href="https://supabase.com/privacy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                            >
                                https://supabase.com/privacy
                            </a>
                        </p>

                        <h3 className="text-lg font-medium mt-6 mb-2">3.2 Brevo</h3>
                        <p>
                            For sending emails, we use Brevo (Sendinblue), a French company based in the EU.
                            Processing takes place in accordance with the GDPR. More information:{" "}
                            <a
                                href="https://www.brevo.com/en/legal/privacypolicy/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                            >
                                https://www.brevo.com/en/legal/privacypolicy/
                            </a>
                        </p>

                        <h3 className="text-lg font-medium mt-6 mb-2">3.3 Vercel</h3>
                        <p>
                            This website is hosted on Vercel Inc. (USA). Vercel processes data in accordance with
                            EU Standard Contractual Clauses. More information:{" "}
                            <a
                                href="https://vercel.com/legal/privacy-policy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                            >
                                https://vercel.com/legal/privacy-policy
                            </a>
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">
                            4. Cookies and Local Storage
                        </h2>
                        <p>
                            We only use technically necessary cookies for authentication. In addition, we store
                            accessibility settings (font size, ease of language) locally in your browser (localStorage).
                            This data is not transmitted to third parties.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">5. Your Rights</h2>
                        <p>According to the GDPR, you have the following rights:</p>
                        <ul className="list-disc pl-6 mt-2">
                            <li>
                                <strong>Right to Information (Art. 15 GDPR):</strong> You can request information about your stored data.
                            </li>
                            <li>
                                <strong>Correction (Art. 16 GDPR):</strong> You can request the correction of incorrect data.
                            </li>
                            <li>
                                <strong>Deletion (Art. 17 GDPR):</strong> You can request the deletion of your data.
                            </li>
                            <li>
                                <strong>Restriction (Art. 18 GDPR):</strong> You can request the restriction of processing.
                            </li>
                            <li>
                                <strong>Data Portability (Art. 20 GDPR):</strong> You can receive your data in a structured format.
                            </li>
                            <li>
                                <strong>Objection (Art. 21 GDPR):</strong> You can object to the processing.
                            </li>
                        </ul>
                        <p className="mt-4">
                            To exercise your rights, please contact us at:{" "}
                            <a
                                href="mailto:contact@bafoeg.ilia.work"
                                className="text-primary hover:underline"
                            >
                                contact@bafoeg.ilia.work
                            </a>
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">
                            6. Right of Appeal to the Supervisory Authority
                        </h2>
                        <p>
                            You have the right to complain to a data protection supervisory authority. Responsible is:
                        </p>
                        <address className="not-italic mt-4 text-sm leading-relaxed">
                            The State Commissioner for Data Protection and for the Right to Inspect Files Brandenburg
                            <br />
                            Stahnsdorfer Damm 77
                            <br />
                            14532 Kleinmachnow
                            <br />
                            <a
                                href="https://www.lda.brandenburg.de"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                            >
                                www.lda.brandenburg.de
                            </a>
                        </address>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">
                            7. Changes to this Privacy Policy
                        </h2>
                        <p>
                            We reserve the right to adapt this privacy policy if necessary to adapt it to changed legal
                            situations or changes to our service. You can always find the current version on this page.
                        </p>
                    </section>
                </article>
            </main>
        )
    }

    // Default / German
    return (
        <main className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8 relative">
            <CloseButton />
            <article className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert">
                <h1 className="text-3xl font-bold mb-8">Datenschutzerklärung</h1>

                <p className="text-sm text-muted-foreground mb-8">
                    Stand: 20. Januar 2026
                </p>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">1. Verantwortliche Stelle</h2>
                    <p>
                        Verantwortlich für die Datenverarbeitung auf dieser Website ist das
                        Forschungsteam des Projekts „Design and Evaluation of an AI-Based
                        Chatbot to Improve Information Access to BAföG Services" an der
                        Universität Potsdam:
                    </p>
                    <address className="not-italic mt-4 text-sm leading-relaxed">
                        Bruk Asrat, Elisa Haxhillazi, Ilia Sokolovskiy, Lamia Islam, Osman
                        Mohmmed, Paul Bakos
                        <br />
                        Universität Potsdam
                        <br />
                        Am Neuen Palais 10
                        <br />
                        14469 Potsdam
                        <br />
                        Deutschland
                        <br />
                        <br />
                        E-Mail:{" "}
                        <a
                            href="mailto:contact@bafoeg.ilia.work"
                            className="text-primary hover:underline"
                        >
                            contact@bafoeg.ilia.work
                        </a>
                    </address>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">
                        2. Erhebung und Speicherung personenbezogener Daten
                    </h2>

                    <h3 className="text-lg font-medium mt-6 mb-2">
                        2.1 Beim Besuch der Website
                    </h3>
                    <p>
                        Beim Aufrufen unserer Website werden durch den auf Ihrem Endgerät
                        zum Einsatz kommenden Browser automatisch folgende Informationen an
                        den Server übermittelt:
                    </p>
                    <ul className="list-disc pl-6 mt-2">
                        <li>IP-Adresse des anfragenden Rechners</li>
                        <li>Datum und Uhrzeit des Zugriffs</li>
                        <li>Name und URL der abgerufenen Datei</li>
                        <li>Website, von der aus der Zugriff erfolgt (Referrer-URL)</li>
                        <li>
                            Verwendeter Browser und ggf. das Betriebssystem Ihres Rechners
                        </li>
                    </ul>
                    <p className="mt-4">
                        Diese Daten werden ausschließlich zur Sicherstellung eines
                        störungsfreien Betriebs der Website und zur Verbesserung unseres
                        Angebots ausgewertet. Eine Zuordnung dieser Daten zu einer
                        bestimmten Person ist uns nicht möglich.
                    </p>

                    <h3 className="text-lg font-medium mt-6 mb-2">
                        2.2 Bei Nutzung des Chatbots (angemeldete Nutzer)
                    </h3>
                    <p>
                        Wenn Sie sich registrieren und den Chatbot nutzen, speichern wir
                        folgende Daten:
                    </p>
                    <ul className="list-disc pl-6 mt-2">
                        <li>E-Mail-Adresse</li>
                        <li>Chat-Verläufe (Fragen und Antworten)</li>
                    </ul>
                    <p className="mt-4">
                        Diese Daten werden gespeichert, um Ihnen einen personalisierten
                        Service zu bieten und frühere Konversationen zugänglich zu machen.
                        Die Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO
                        (Vertragserfüllung).
                    </p>

                    <h3 className="text-lg font-medium mt-6 mb-2">
                        2.3 Bei Nutzung des Inkognito-Modus
                    </h3>
                    <p>
                        Im Inkognito-Modus werden keine personenbezogenen Daten dauerhaft
                        gespeichert. Alle Chatdaten werden ausschließlich temporär in Ihrem
                        Browser gehalten und beim Schließen der Sitzung gelöscht.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">
                        3. Auftragsverarbeiter und Drittländer
                    </h2>

                    <h3 className="text-lg font-medium mt-6 mb-2">3.1 Supabase</h3>
                    <p>
                        Wir nutzen Supabase Inc. (USA) als Datenbank- und
                        Authentifizierungsanbieter. Supabase verarbeitet Daten gemäß den
                        EU-Standardvertragsklauseln. Weitere Informationen:{" "}
                        <a
                            href="https://supabase.com/privacy"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                        >
                            https://supabase.com/privacy
                        </a>
                    </p>

                    <h3 className="text-lg font-medium mt-6 mb-2">3.2 Brevo</h3>
                    <p>
                        Für den E-Mail-Versand nutzen wir Brevo (Sendinblue), ein
                        französisches Unternehmen mit Sitz in der EU. Die Verarbeitung
                        erfolgt gemäß DSGVO. Weitere Informationen:{" "}
                        <a
                            href="https://www.brevo.com/de/legal/privacypolicy/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                        >
                            https://www.brevo.com/de/legal/privacypolicy/
                        </a>
                    </p>

                    <h3 className="text-lg font-medium mt-6 mb-2">3.3 Vercel</h3>
                    <p>
                        Diese Website wird auf Vercel Inc. (USA) gehostet. Vercel
                        verarbeitet Daten gemäß den EU-Standardvertragsklauseln. Weitere
                        Informationen:{" "}
                        <a
                            href="https://vercel.com/legal/privacy-policy"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                        >
                            https://vercel.com/legal/privacy-policy
                        </a>
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">
                        4. Cookies und lokale Speicherung
                    </h2>
                    <p>
                        Wir verwenden ausschließlich technisch notwendige Cookies für die
                        Authentifizierung. Darüber hinaus speichern wir
                        Barrierefreiheitseinstellungen (Schriftgröße, Leichte Sprache)
                        lokal in Ihrem Browser (localStorage). Diese Daten werden nicht an
                        Dritte übermittelt.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">5. Ihre Rechte</h2>
                    <p>Gemäß DSGVO haben Sie folgende Rechte:</p>
                    <ul className="list-disc pl-6 mt-2">
                        <li>
                            <strong>Auskunftsrecht (Art. 15 DSGVO):</strong> Sie können
                            Auskunft über Ihre gespeicherten Daten verlangen.
                        </li>
                        <li>
                            <strong>Berichtigung (Art. 16 DSGVO):</strong> Sie können die
                            Berichtigung unrichtiger Daten verlangen.
                        </li>
                        <li>
                            <strong>Löschung (Art. 17 DSGVO):</strong> Sie können die Löschung
                            Ihrer Daten verlangen.
                        </li>
                        <li>
                            <strong>Einschränkung (Art. 18 DSGVO):</strong> Sie können die
                            Einschränkung der Verarbeitung verlangen.
                        </li>
                        <li>
                            <strong>Datenübertragbarkeit (Art. 20 DSGVO):</strong> Sie können
                            Ihre Daten in einem strukturierten Format erhalten.
                        </li>
                        <li>
                            <strong>Widerspruch (Art. 21 DSGVO):</strong> Sie können der
                            Verarbeitung widersprechen.
                        </li>
                    </ul>
                    <p className="mt-4">
                        Zur Ausübung Ihrer Rechte kontaktieren Sie uns bitte unter:{" "}
                        <a
                            href="mailto:contact@bafoeg.ilia.work"
                            className="text-primary hover:underline"
                        >
                            contact@bafoeg.ilia.work
                        </a>
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">
                        6. Beschwerderecht bei der Aufsichtsbehörde
                    </h2>
                    <p>
                        Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu
                        beschweren. Zuständig ist:
                    </p>
                    <address className="not-italic mt-4 text-sm leading-relaxed">
                        Die Landesbeauftragte für den Datenschutz und für das Recht auf
                        Akteneinsicht Brandenburg
                        <br />
                        Stahnsdorfer Damm 77
                        <br />
                        14532 Kleinmachnow
                        <br />
                        <a
                            href="https://www.lda.brandenburg.de"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                        >
                            www.lda.brandenburg.de
                        </a>
                    </address>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">
                        7. Änderung dieser Datenschutzerklärung
                    </h2>
                    <p>
                        Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf
                        anzupassen, um sie an geänderte Rechtslagen oder Änderungen unseres
                        Dienstes anzupassen. Die aktuelle Version finden Sie stets auf
                        dieser Seite.
                    </p>
                </section>
            </article>
        </main>
    )
}
