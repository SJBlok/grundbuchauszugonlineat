import { Layout } from "@/components/layout/Layout";

export default function Widerruf() {
  return (
    <Layout>
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto prose prose-lg">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Widerrufsbelehrung
            </h1>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              Anbieter
            </h2>
            <p className="text-muted-foreground mb-4">
              <strong>Tophallen Bouw B.V.</strong><br />
              Stavenisse, Kerkweg 1a<br />
              KVK: 87289792<br />
              E-Mail:{" "}
              <a href="mailto:info@grundbuchauszugonline.de" className="text-primary hover:underline">
                info@grundbuchauszugonline.de
              </a>
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              Fernabsatz und Leistungsbeginn
            </h2>
            <p className="text-muted-foreground mb-4">
              Unsere Dienstleistungen werden ausschließlich im Fernabsatz erbracht. Wir beginnen unmittelbar nach Vertragsschluss mit der Bearbeitung der Bestellung.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              Stornierung
            </h2>
            <p className="text-muted-foreground mb-4">
              Eine Stornierung ist nur möglich, solange das Dokument noch nicht an den Kunden übermittelt wurde. Nach erfolgter Lieferung ist eine Stornierung oder Rückerstattung ausgeschlossen.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              Gesetzliches Rücktrittsrecht
            </h2>
            <p className="text-muted-foreground mb-4">
              Gemäß § 18 Abs. 1 Z 1 FAGG kann das gesetzliche Rücktrittsrecht entfallen, sobald die Dienstleistung vollständig erbracht wurde.
            </p>

            <div className="bg-info p-6 rounded-lg mt-8">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Hinweis
              </h3>
              <p className="text-muted-foreground">
                Mit der Bestätigung Ihrer Bestellung stimmen Sie zu, dass wir mit der Ausführung der Dienstleistung sofort beginnen. Sie nehmen zur Kenntnis, dass Ihr Widerrufsrecht erlischt, sobald der Grundbuchauszug per E-Mail versendet wurde.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
