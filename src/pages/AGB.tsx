import { Layout } from "@/components/layout/Layout";

export default function AGB() {
  return (
    <Layout>
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto prose prose-lg">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Allgemeine Geschäftsbedingungen
            </h1>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              1. Geltungsbereich
            </h2>
            <p className="text-muted-foreground mb-4">
              Diese Allgemeinen Geschäftsbedingungen gelten für alle Bestellungen, die über diese Website getätigt werden. Mit der Bestellung akzeptieren Sie diese Bedingungen.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              2. Vertragspartner
            </h2>
            <p className="text-muted-foreground mb-4">
              Der Vertrag kommt zustande mit Application Assistant Ltd. Die vollständigen Kontaktdaten finden Sie im Impressum.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              3. Leistungsbeschreibung
            </h2>
            <p className="text-muted-foreground mb-4">
              Wir unterstützen Sie bei der Anforderung eines aktuellen Grundbuchauszugs aus dem österreichischen Grundbuch. Der Grundbuchauszug wird per E-Mail an die angegebene Adresse versendet.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              4. Preise und Zahlung
            </h2>
            <p className="text-muted-foreground mb-4">
              Alle Preise verstehen sich in Euro inklusive gesetzlicher Umsatzsteuer. Die Zahlung erfolgt auf Rechnung (Überweisung). Die Zahlungsfrist beträgt 14 Tage ab Rechnungsdatum.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              5. Lieferung
            </h2>
            <p className="text-muted-foreground mb-4">
              Der Grundbuchauszug wird elektronisch per E-Mail zugestellt. Die Zustellung erfolgt in der Regel innerhalb weniger Minuten nach Bestellabschluss.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              6. Haftung
            </h2>
            <p className="text-muted-foreground mb-4">
              Wir haften für die korrekte Übermittlung der angeforderten Grundbuchinformationen. Für die Richtigkeit der im Grundbuch eingetragenen Daten übernehmen wir keine Gewähr.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              7. Schlussbestimmungen
            </h2>
            <p className="text-muted-foreground mb-4">
              Es gilt österreichisches Recht. Gerichtsstand ist der Sitz des Unternehmens, sofern der Kunde Unternehmer ist.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
