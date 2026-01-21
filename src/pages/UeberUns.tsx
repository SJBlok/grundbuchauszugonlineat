import { Layout } from "@/components/layout/Layout";

export default function UeberUns() {
  return (
    <Layout>
      <section className="py-8 md:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-6">
              Über uns
            </h1>

            <div className="space-y-8">
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-foreground mb-3">
                  Wer wir sind
                </h2>
                <div className="space-y-3 text-sm md:text-base text-muted-foreground leading-relaxed">
                  <p>
                    grundbuchauszugonline.at ist ein unabhängiger Online-Service, betrieben von Tophallen Bouw B.V., einem privatwirtschaftlichen Unternehmen.
                  </p>
                  <p>
                    Wir sind keine Behörde, keine staatliche Stelle und nicht Teil des österreichischen Grundbuchs. Wir stehen in keiner Verbindung zu österreichischen Gerichten, Ministerien oder sonstigen öffentlichen Institutionen.
                  </p>
                  <p>
                    Unser Service richtet sich an Privatpersonen und Unternehmen, die Unterstützung bei der Beantragung eines österreichischen Grundbuchauszugs wünschen und Wert auf einen klaren, digitalen und begleiteten Ablauf legen.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-lg md:text-xl font-semibold text-foreground mb-3">
                  Unsere Dienstleistung
                </h2>
                <div className="space-y-3 text-sm md:text-base text-muted-foreground leading-relaxed">
                  <p>
                    Wir bieten eine kostenpflichtige Vermittlungs- und Bearbeitungsdienstleistung rund um den Grundbuchauszug an.
                  </p>
                  <p>Unsere Leistung umfasst insbesondere:</p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>Entgegennahme Ihrer Anfrage über unsere Website</li>
                    <li>Prüfung der übermittelten Angaben auf Vollständigkeit</li>
                    <li>Administrative Aufbereitung der Anfrage</li>
                    <li>Weiterleitung der Anfrage an die zuständigen österreichischen Stellen</li>
                    <li>Digitale Übermittlung des erhaltenen Grundbuchauszugs per E-Mail</li>
                  </ul>
                  <p>
                    Unsere Dienstleistungen werden ausschließlich digital erbracht. Nach Zustandekommen des Vertrages beginnen wir unverzüglich mit der Bearbeitung Ihrer Anfrage.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-lg md:text-xl font-semibold text-foreground mb-3">
                  Herkunft der Dokumente
                </h2>
                <div className="space-y-3 text-sm md:text-base text-muted-foreground leading-relaxed">
                  <p>
                    Alle über grundbuchauszugonline.at bereitgestellten Dokumente stammen aus dem österreichischen Grundbuch, das von den zuständigen staatlichen Stellen geführt wird.
                  </p>
                  <p>Wir weisen ausdrücklich darauf hin:</p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>Wir führen keine eigene Grundbuchdatenbank</li>
                    <li>Wir haben keinen Einfluss auf Inhalte, Richtigkeit oder Bearbeitungszeiten</li>
                    <li>Wir erhalten und übermitteln ausschließlich die Dokumente, die von den zuständigen Behörden bereitgestellt werden</li>
                  </ul>
                  <p>
                    Die gelieferten Grundbuchauszüge entsprechen den offiziellen, behördlichen Unterlagen.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-lg md:text-xl font-semibold text-foreground mb-3">
                  Unabhängigkeit von Behörden
                </h2>
                <div className="space-y-3 text-sm md:text-base text-muted-foreground leading-relaxed">
                  <p>
                    grundbuchauszugonline.at ist ein vollständig unabhängiger, kommerzieller Online-Dienst.
                  </p>
                  <p>Wir sind:</p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>kein offizielles Behördenportal</li>
                    <li>nicht Teil des österreichischen Justizsystems</li>
                    <li>nicht von staatlichen Stellen beauftragt oder empfohlen</li>
                  </ul>
                  <p>
                    Ein Grundbuchauszug kann auch direkt über offizielle staatliche Stellen beantragt werden, gegebenenfalls zu geringeren oder keinen Kosten. Die Nutzung unseres Services ist freiwillig und stellt eine zusätzliche Serviceleistung dar.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-lg md:text-xl font-semibold text-foreground mb-3">
                  Kontakt
                </h2>
                <p className="text-sm md:text-base text-muted-foreground mb-4">
                  Bei Fragen zu unserem Service oder zu Ihrer Bestellung erreichen Sie uns unter:
                </p>
                <div className="bg-info p-4 md:p-6 rounded-xl space-y-3 text-sm md:text-base">
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">E-Mail:</strong>{" "}
                    <a href="mailto:info@grundbuchauszugonline.de" className="text-primary hover:underline break-all">
                      info@grundbuchauszugonline.de
                    </a>
                  </p>
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Website:</strong>{" "}
                    <a href="https://grundbuchauszugonline.at" className="text-primary hover:underline break-all">
                      grundbuchauszugonline.at
                    </a>
                  </p>
                  <div className="pt-2 border-t border-border">
                    <p className="text-muted-foreground mb-1">
                      <strong className="text-foreground">Unternehmen:</strong>
                    </p>
                    <p className="text-muted-foreground">
                      Tophallen Bouw B.V.<br />
                      Stavenisse, Kerkweg 1a<br />
                      Hauptniederlassung<br />
                      Handelsregisternummer (KVK): 87289792
                    </p>
                  </div>
                </div>
                <p className="text-sm md:text-base text-muted-foreground mt-4">
                  Wir beantworten Anfragen in der Regel werktags innerhalb von 24–48 Stunden.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
