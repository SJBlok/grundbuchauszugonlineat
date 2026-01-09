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
                <strong>Application Assistant Ltd</strong>
              </p>
              <p className="text-muted-foreground mb-4">
                [Adresse wird ergänzt]
              </p>
              <p className="text-muted-foreground">
                <strong>E-Mail:</strong> kontakt@grundbuchauszugonline.at
              </p>
            </div>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              Umsatzsteuer-Identifikationsnummer
            </h2>
            <p className="text-muted-foreground mb-4">
              [UID-Nummer wird ergänzt]
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              Handelsregister
            </h2>
            <p className="text-muted-foreground mb-4">
              [Handelsregisternummer wird ergänzt]
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              Streitschlichtung
            </h2>
            <p className="text-muted-foreground mb-4">
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr. Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              Haftung für Inhalte
            </h2>
            <p className="text-muted-foreground mb-4">
              Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Wir sind jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
