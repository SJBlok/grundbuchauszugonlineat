import { Layout } from "@/components/layout/Layout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Was ist ein Grundbuchauszug?",
    answer:
      "Ein Grundbuchauszug ist ein offizielles Dokument aus dem österreichischen Grundbuch, das alle wesentlichen Informationen zu einem Grundstück oder einer Liegenschaft enthält. Er umfasst Angaben zu Eigentumsverhältnissen, Grundstücksdaten und eingetragenen Belastungen wie Hypotheken oder Dienstbarkeiten.",
  },
  {
    question: "Welche Informationen sind im Grundbuchauszug enthalten?",
    answer:
      "Der Grundbuchauszug enthält drei Hauptteile: Das A-Blatt (Gutsbestandsblatt) mit Grundstücksbeschreibung und Fläche, das B-Blatt (Eigentumsblatt) mit Angaben zu den Eigentümern und deren Anteilen, sowie das C-Blatt (Lastenblatt) mit allen eingetragenen Belastungen wie Hypotheken, Pfandrechten und Dienstbarkeiten.",
  },
  {
    question: "Wie schnell erfolgt die Zustellung?",
    answer:
      "Nach Abschluss Ihrer Bestellung wird der Grundbuchauszug innerhalb weniger Minuten per E-Mail an Sie versendet. Sie erhalten das Dokument direkt in Ihrem E-Mail-Postfach.",
  },
  {
    question: "Wie funktioniert die Zahlung auf Rechnung?",
    answer:
      "Nach Abschluss der Bestellung erhalten Sie eine Rechnung per E-Mail. Der Rechnungsbetrag ist unter Angabe der Bestellnummer als Verwendungszweck auf das angegebene Bankkonto zu überweisen. Die Zahlungsfrist beträgt in der Regel 14 Tage.",
  },
  {
    question: "Sind meine Daten sicher?",
    answer:
      "Ja, Ihre Daten werden vertraulich behandelt und gemäß den geltenden Datenschutzbestimmungen verarbeitet. Wir verwenden sichere Verschlüsselungstechnologien und geben Ihre Daten nicht an Dritte weiter. Weitere Informationen finden Sie in unserer Datenschutzerklärung.",
  },
];

export default function FAQ() {
  return (
    <Layout>
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Häufig gestellte Fragen
            </h1>
            <p className="text-lg text-muted-foreground mb-12">
              Hier finden Sie Antworten auf die wichtigsten Fragen rund um den Grundbuchauszug.
            </p>

            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </Layout>
  );
}
