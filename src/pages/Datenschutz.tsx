import { Layout } from "@/components/layout/Layout";

export default function Datenschutz() {
  return (
    <Layout>
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto prose prose-lg">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Datenschutzerklärung
            </h1>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              1. Verantwortlicher
            </h2>
            <p className="text-muted-foreground mb-4">
              Verantwortlicher für die Datenverarbeitung auf dieser Website ist Application Assistant Ltd. Kontaktdaten finden Sie im Impressum.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              2. Erhebung und Verarbeitung personenbezogener Daten
            </h2>
            <p className="text-muted-foreground mb-4">
              Wir erheben personenbezogene Daten, wenn Sie diese im Rahmen einer Bestellung freiwillig angeben. Dies umfasst: Name, E-Mail-Adresse, Wohnsitzland und ggf. Firmenname.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              3. Zweck der Datenverarbeitung
            </h2>
            <p className="text-muted-foreground mb-4">
              Ihre Daten werden ausschließlich zur Abwicklung Ihrer Bestellung verwendet. Dies beinhaltet die Bearbeitung des Grundbuchauszugs, den Versand per E-Mail sowie die Rechnungsstellung.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              4. Datenweitergabe
            </h2>
            <p className="text-muted-foreground mb-4">
              Eine Weitergabe Ihrer Daten an Dritte erfolgt nur, soweit dies zur Vertragserfüllung erforderlich ist oder Sie ausdrücklich eingewilligt haben.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              5. Datensicherheit
            </h2>
            <p className="text-muted-foreground mb-4">
              Wir setzen technische und organisatorische Sicherheitsmaßnahmen ein, um Ihre Daten gegen Manipulation, Verlust, Zerstörung oder unbefugten Zugriff zu schützen.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              6. Ihre Rechte
            </h2>
            <p className="text-muted-foreground mb-4">
              Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung Ihrer personenbezogenen Daten. Bei Fragen wenden Sie sich bitte an uns per E-Mail.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              7. Cookies
            </h2>
            <p className="text-muted-foreground mb-4">
              Diese Website verwendet nur technisch notwendige Cookies, die für den Betrieb der Website erforderlich sind.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
