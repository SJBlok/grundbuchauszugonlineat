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
              1. Allgemeines
            </h2>
            <p className="text-muted-foreground mb-4">
              Der Schutz personenbezogener Daten ist uns ein wichtiges Anliegen. Die Verarbeitung erfolgt gemäß der Datenschutz-Grundverordnung (DSGVO).
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              2. Verantwortlicher
            </h2>
            <p className="text-muted-foreground mb-4">
              Verantwortlich für die Datenverarbeitung:
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Tophallen Bouw B.V.</strong><br />
              Stavenisse, Kerkweg 1a<br />
              KVK 87289792<br />
              E-Mail: <a href="mailto:info@grundbuchauszugonline.de" className="text-primary hover:underline">info@grundbuchauszugonline.de</a>
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              3. Verarbeitete personenbezogene Daten
            </h2>
            <p className="text-muted-foreground mb-2">Wir verarbeiten insbesondere folgende Daten:</p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4">
              <li>Name / Firmenname</li>
              <li>Adressdaten</li>
              <li>Grundbuch- bzw. Objektangaben</li>
              <li>E-Mail-Adresse</li>
              <li>Technische Daten (z. B. IP-Adresse)</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              4. Zwecke der Verarbeitung
            </h2>
            <p className="text-muted-foreground mb-2">Die Datenverarbeitung erfolgt zum Zweck:</p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4">
              <li>der Durchführung unserer Dienstleistung</li>
              <li>der Kommunikation mit dem Kunden</li>
              <li>der Rechnungsstellung</li>
              <li>der Erfüllung gesetzlicher Verpflichtungen</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              5. Rechtsgrundlage
            </h2>
            <p className="text-muted-foreground mb-2">Die Verarbeitung erfolgt auf Basis von:</p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4">
              <li>Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)</li>
              <li>Art. 6 Abs. 1 lit. c DSGVO (rechtliche Verpflichtung)</li>
              <li>Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              6. Weitergabe von Daten
            </h2>
            <p className="text-muted-foreground mb-2">Personenbezogene Daten werden ausschließlich weitergegeben an:</p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4">
              <li>zuständige österreichische Behörden</li>
              <li>technische Dienstleister (z. B. Hosting, E-Mail)</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              Eine Weitergabe zu Werbezwecken erfolgt nicht.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              7. Speicherdauer
            </h2>
            <p className="text-muted-foreground mb-4">
              Personenbezogene Daten werden nur so lange gespeichert, wie dies für die genannten Zwecke erforderlich ist oder gesetzliche Aufbewahrungspflichten bestehen.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              8. Rechte der betroffenen Personen
            </h2>
            <p className="text-muted-foreground mb-2">Betroffene Personen haben das Recht auf:</p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4">
              <li>Auskunft</li>
              <li>Berichtigung</li>
              <li>Löschung</li>
              <li>Einschränkung der Verarbeitung</li>
              <li>Datenübertragbarkeit</li>
              <li>Widerspruch</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              Anfragen können jederzeit per E-Mail gestellt werden.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              9. Datensicherheit
            </h2>
            <p className="text-muted-foreground mb-4">
              Wir setzen geeignete technische und organisatorische Maßnahmen ein, um personenbezogene Daten vor Verlust, Missbrauch und unbefugtem Zugriff zu schützen.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              10. Änderungen
            </h2>
            <p className="text-muted-foreground mb-4">
              Diese Datenschutzerklärung kann jederzeit angepasst werden. Die jeweils aktuelle Version ist auf grundbuchauszugonline.at abrufbar.
            </p>

            <p className="text-muted-foreground mt-8 text-sm">
              Stand: 2026
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
