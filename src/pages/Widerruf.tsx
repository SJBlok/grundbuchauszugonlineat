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
              Widerrufsrecht
            </h2>
            <p className="text-muted-foreground mb-4">
              Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              Ausübung des Widerrufsrechts
            </h2>
            <p className="text-muted-foreground mb-4">
              Um Ihr Widerrufsrecht auszuüben, müssen Sie uns mittels einer eindeutigen Erklärung (z.B. per E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren. Die Kontaktdaten finden Sie im Impressum.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              Folgen des Widerrufs
            </h2>
            <p className="text-muted-foreground mb-4">
              Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf bei uns eingegangen ist.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              Ausschluss des Widerrufsrechts
            </h2>
            <p className="text-muted-foreground mb-4">
              Das Widerrufsrecht erlischt bei einem Vertrag zur Erbringung von Dienstleistungen, wenn der Unternehmer die Dienstleistung vollständig erbracht hat und mit der Ausführung der Dienstleistung erst begonnen hat, nachdem der Verbraucher dazu seine ausdrückliche Zustimmung gegeben hat und gleichzeitig seine Kenntnis davon bestätigt hat, dass er sein Widerrufsrecht bei vollständiger Vertragserfüllung durch den Unternehmer verliert.
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
