import { Layout } from "@/components/layout/Layout";

export default function Impressum() {
  return (
    <Layout>
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto prose prose-lg">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Impressum
            </h1>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              Angaben gemäß § 5 ECG
            </h2>
            
            <div className="bg-info p-6 rounded-lg mb-8">
              <p className="text-foreground mb-2">
                <strong>Tophallen Bouw B.V.</strong>
              </p>
              <p className="text-muted-foreground mb-2">
                Stavenisse, Kerkweg 1a<br />
                Hauptniederlassung
              </p>
              <p className="text-muted-foreground mb-2">
                <strong>Handelsregisternummer (KVK):</strong> 87289792
              </p>
              <p className="text-muted-foreground">
                <strong>E-Mail:</strong>{" "}
                <a href="mailto:info@grundbuchauszugonline.de" className="text-primary hover:underline">
                  info@grundbuchauszugonline.de
                </a>
              </p>
            </div>

            <p className="text-muted-foreground mb-8">
              Tophallen Bouw B.V. ist ein privates, kommerzielles Unternehmen und kein öffentliches Amt.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              Streitschlichtung
            </h2>
            <p className="text-muted-foreground mb-4">
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
              <a 
                href="https://ec.europa.eu/consumers/odr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                https://ec.europa.eu/consumers/odr
              </a>
              . Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              Haftung für Inhalte
            </h2>
            <p className="text-muted-foreground mb-4">
              Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Wir sind jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              Keine Behördenwebsite
            </h2>
            <p className="text-muted-foreground mb-4">
              Grundbuchauszugonline.at ist keine offizielle Website der Republik Österreich, steht in keiner Verbindung zu österreichischen Behörden und ist kein Teil des österreichischen Grundbuchsystems.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
