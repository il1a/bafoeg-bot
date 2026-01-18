import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Impressum — BAföG Bot",
    description: "Impressum und rechtliche Informationen für den BAföG Bot",
};

export default function ImpressumPage() {
    return (
        <main className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
            <article className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert">
                <h1 className="text-3xl font-bold mb-8">Impressum</h1>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Angaben gemäß § 5 TMG</h2>
                    <p>
                        Diese Website ist ein Forschungsprojekt der Universität Potsdam im
                        Rahmen der wissenschaftlichen Arbeit:
                    </p>
                    <p className="mt-4 italic">
                        „Design and Evaluation of an AI-Based Chatbot to Improve Information
                        Access to BAföG Services"
                    </p>
                    <p className="mt-4">Projektlaufzeit: bis 15. Februar 2026</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">
                        Verantwortlich für den Inhalt
                    </h2>
                    <address className="not-italic">
                        Universität Potsdam
                        <br />
                        Am Neuen Palais 10
                        <br />
                        14469 Potsdam
                        <br />
                        Deutschland
                    </address>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Projektteam</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="p-4 rounded-lg border border-border bg-card">
                            <p className="font-medium">Bruk Asrat</p>
                            <a
                                href="mailto:bruk.asrat.tsega@uni-potsdam.de"
                                className="text-sm text-primary hover:underline"
                            >
                                bruk.asrat.tsega@uni-potsdam.de
                            </a>
                        </div>
                        <div className="p-4 rounded-lg border border-border bg-card">
                            <p className="font-medium">Elisa Haxhillazi</p>
                            <a
                                href="mailto:elisa.haxhillazi@uni-potsdam.de"
                                className="text-sm text-primary hover:underline"
                            >
                                elisa.haxhillazi@uni-potsdam.de
                            </a>
                        </div>
                        <div className="p-4 rounded-lg border border-border bg-card">
                            <p className="font-medium">Ilia Sokolovskiy</p>
                            <a
                                href="mailto:ilia.sokolovskiy@uni-potsdam.de"
                                className="text-sm text-primary hover:underline"
                            >
                                ilia.sokolovskiy@uni-potsdam.de
                            </a>
                        </div>
                        <div className="p-4 rounded-lg border border-border bg-card">
                            <p className="font-medium">Lamia Islam</p>
                            <a
                                href="mailto:lamia.islam@uni-potsdam.de"
                                className="text-sm text-primary hover:underline"
                            >
                                lamia.islam@uni-potsdam.de
                            </a>
                        </div>
                        <div className="p-4 rounded-lg border border-border bg-card">
                            <p className="font-medium">Osman Mohmmed</p>
                            <a
                                href="mailto:osman.eltahir@uni-potsdam.de"
                                className="text-sm text-primary hover:underline"
                            >
                                osman.eltahir@uni-potsdam.de
                            </a>
                        </div>
                        <div className="p-4 rounded-lg border border-border bg-card">
                            <p className="font-medium">Paul Bakos</p>
                            <a
                                href="mailto:paul.bakos@uni-potsdam.de"
                                className="text-sm text-primary hover:underline"
                            >
                                paul.bakos@uni-potsdam.de
                            </a>
                        </div>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Kontakt</h2>
                    <p>
                        Bei Fragen zu diesem Projekt oder der Website wenden Sie sich bitte
                        an:
                    </p>
                    <p className="mt-2">
                        E-Mail:{" "}
                        <a
                            href="mailto:ilia.sokolovskiy@uni-potsdam.de"
                            className="text-primary hover:underline"
                        >
                            ilia.sokolovskiy@uni-potsdam.de
                        </a>
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Haftungsausschluss</h2>

                    <h3 className="text-lg font-medium mt-6 mb-2">Haftung für Inhalte</h3>
                    <p>
                        Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für
                        die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können
                        wir jedoch keine Gewähr übernehmen. Als Forschungsprojekt stellen
                        wir keine rechtsverbindlichen Auskünfte zu BAföG bereit. Bei
                        konkreten Fragen wenden Sie sich bitte an das zuständige BAföG-Amt.
                    </p>

                    <h3 className="text-lg font-medium mt-6 mb-2">Haftung für Links</h3>
                    <p>
                        Unser Angebot enthält Links zu externen Websites Dritter, auf deren
                        Inhalte wir keinen Einfluss haben. Deshalb können wir für diese
                        fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der
                        verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber
                        der Seiten verantwortlich.
                    </p>

                    <h3 className="text-lg font-medium mt-6 mb-2">KI-Hinweis</h3>
                    <p>
                        Der BAföG Bot verwendet Künstliche Intelligenz zur Beantwortung von
                        Fragen. Die Antworten basieren auf öffentlich verfügbaren
                        Informationen und können Fehler enthalten. Alle Angaben sind ohne
                        Gewähr. Für verbindliche Auskünfte wenden Sie sich an das zuständige
                        BAföG-Amt oder die Studierendenwerke.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Urheberrecht</h2>
                    <p>
                        Der Quellcode dieses Projekts ist unter der MIT-Lizenz
                        veröffentlicht und auf GitHub verfügbar. Die auf der Website
                        dargestellten Inhalte und Werke unterliegen dem deutschen
                        Urheberrecht.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Open Source</h2>
                    <p>
                        Dieses Projekt ist Open Source. Der vollständige Quellcode ist auf
                        GitHub verfügbar:
                    </p>
                    <p className="mt-2">
                        <a
                            href="https://github.com/il1a/bafoeg-bot"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                        >
                            github.com/il1a/bafoeg-bot
                        </a>
                    </p>
                </section>
            </article>
        </main>
    );
}
