import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Datenschutzerklärung — BAföG Bot",
    description: "Datenschutzerklärung für den BAföG Bot",
};

export default function DatenschutzPage() {
    return (
        <main className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
            <article className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert">
                <h1 className="text-3xl font-bold mb-8">Datenschutzerklärung</h1>

                <p className="text-sm text-muted-foreground mb-8">
                    Stand: 18. Januar 2026
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
                            href="mailto:ilia.sokolovskiy@uni-potsdam.de"
                            className="text-primary hover:underline"
                        >
                            ilia.sokolovskiy@uni-potsdam.de
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
                            href="mailto:ilia.sokolovskiy@uni-potsdam.de"
                            className="text-primary hover:underline"
                        >
                            ilia.sokolovskiy@uni-potsdam.de
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
    );
}
