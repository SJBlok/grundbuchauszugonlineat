import { Layout } from "@/components/layout/Layout";

export default function UeberUns() {
  return (
    <Layout>
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto prose prose-lg">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Über uns
            </h1>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              Wer wir sind
            </h2>
            <p className="text-muted-foreground mb-4">
              grundbuchauszugonline.at ist ein unabhängiger Online-Service, betrieben von Tophallen Bouw B.V., einem privatwirtschaftlichen Unternehmen.
            </p>
            <p className="text-muted-foreground mb-4">
              Wir sind keine Behörde, keine staatliche Stelle und nicht Teil des österreichischen Grundbuchs. Wir stehen in keiner Verbindung zu österreichischen Gerichten, Ministerien oder sonstigen öffentlichen Institutionen.
            </p>
            <p className="text-muted-foreground mb-4">
              Unser Service richtet sich an Privatpersonen und Unternehmen, die Unterstützung bei der Beantragung eines österreichischen Grundbuchauszugs wünschen und Wert auf einen klaren, digitalen und begleiteten Ablauf legen.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              Unsere Dienstleistung
            </h2>
            <p className="text-muted-foreground mb-4">
              Wir bieten eine kostenpflichtige Vermittlungs- und Bearbeitungsdienstleistung rund um den Grundbuchauszug an.
            </p>
            <p className="text-muted-foreground mb-2">Unsere Leistung umfasst insbesondere:</p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4">
              <li>Entgegennahme Ihrer Anfrage über unsere Website</li>
              <li>Prüfung der übermittelten Angaben auf Vollständigkeit</li>
              <li>Administrative Aufbereitung der Anfrage</li>
              <li>Weiterleitung der Anfrage an die zuständigen österreichischen Stellen</li>
              <li>Digitale Übermittlung des erhaltenen Grundbuchauszugs per E-Mail</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              Unsere Dienstleistungen werden ausschließlich digital erbracht. Nach Zustandekommen des Vertrages beginnen wir unverzüglich mit der Bearbeitung Ihrer Anfrage.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              Herkunft der Dokumente
            </h2>
            <p className="text-muted-foreground mb-4">
              Alle über grundbuchauszugonline.at bereitgestellten Dokumente stammen aus dem österreichischen Grundbuch, das von den zuständigen staatlichen Stellen geführt wird.
            </p>
            <p className="text-muted-foreground mb-2">Wir weisen ausdrücklich darauf hin:</p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4">
              <li>Wir führen keine eigene Grundbuchdatenbank</li>
              <li>Wir haben keinen Einfluss auf Inhalte, Richtigkeit oder Bearbeitungszeiten</li>
              <li>Wir erhalten und übermitteln ausschließlich die Dokumente, die von den zuständigen Behörden bereitgestellt werden</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              Die gelieferten Grundbuchauszüge entsprechen den offiziellen, behördlichen Unterlagen.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              Unabhängigkeit von Behörden
            </h2>
            <p className="text-muted-foreground mb-4">
              grundbuchauszugonline.at ist ein vollständig unabhängiger, kommerzieller Online-Dienst.
            </p>
            <p className="text-muted-foreground mb-2">Wir sind:</p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4">
              <li>kein offizielles Behördenportal</li>
              <li>nicht Teil des österreichischen Justizsystems</li>
              <li>nicht von staatlichen Stellen beauftragt oder empfohlen</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              Ein Grundbuchauszug kann auch direkt über offizielle staatliche Stellen beantragt werden, gegebenenfalls zu geringeren oder keinen Kosten. Die Nutzung unseres Services ist freiwillig und stellt eine zusätzliche Serviceleistung dar.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              Kontakt
            </h2>
            <p className="text-muted-foreground mb-4">
              Bei Fragen zu unserem Service oder zu Ihrer Bestellung erreichen Sie uns unter:
            </p>
            <div className="bg-info p-6 rounded-lg mb-4">
              <p className="text-muted-foreground mb-2">
                <strong>E-Mail:</strong>{" "}
                <a href="mailto:info@grundbuchauszugonline.de" className="text-primary hover:underline">
                  info@grundbuchauszugonline.de
                </a>
              </p>
              <p className="text-muted-foreground mb-4">
                <strong>Website:</strong>{" "}
                <a href="https://grundbuchauszugonline.at" className="text-primary hover:underline">
                  https://grundbuchauszugonline.at
                </a>
              </p>
              <p className="text-muted-foreground mb-2">
                <strong>Unternehmen:</strong>
              </p>
              <p className="text-muted-foreground">
                Tophallen Bouw B.V.<br />
                Stavenisse, Kerkweg 1a<br />
                Hauptniederlassung<br />
                Handelsregisternummer (KVK): 87289792
              </p>
            </div>
            <p className="text-muted-foreground">
              Wir beantworten Anfragen in der Regel werktags innerhalb von 24–48 Stunden.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
