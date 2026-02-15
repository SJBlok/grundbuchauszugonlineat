import { Layout } from "@/components/layout/Layout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

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
    question: "Wer kann einen Grundbuchauszug anfordern?",
    answer:
      "Das Grundbuch ist ein öffentlich geführtes Register und ist für jeden einsehbar. Jede Person ist berechtigt, einen Grundbuchauszug online anzufordern. Es ist keine Begründung oder Nachweis eines berechtigten Interesses erforderlich.",
  },
  {
    question: "Wie schnell erfolgt die Zustellung?",
    answer:
      "Nach Abschluss Ihrer Bestellung wird der Grundbuchauszug innerhalb weniger Minuten per E-Mail an Sie versendet. Sie erhalten das Dokument direkt als PDF in Ihrem E-Mail-Postfach.",
  },
  {
    question: "Ist der Grundbuchauszug amtlich signiert?",
    answer:
      "Ja, jeder Grundbuchauszug enthält am Ende des PDF-Dokuments eine elektronische Signatur der Justiz. Diese Signatur ist eine amtliche Bestätigung, dass der Inhalt original, vollständig und nicht verändert ist.",
  },
  {
    question: "Wie funktioniert die Zahlung auf Rechnung?",
    answer:
      "Nach Abschluss der Bestellung erhalten Sie eine Rechnung per E-Mail. Der Rechnungsbetrag ist unter Angabe der Bestellnummer als Verwendungszweck auf das angegebene Bankkonto zu überweisen. Die Zahlungsfrist beträgt in der Regel 14 Tage.",
  },
  {
    question: "Was ist eine Katastralgemeinde?",
    answer:
      "Eine Katastralgemeinde (KG) ist Teil einer Gemeinde – das heißt, Gemeinden können aus mehreren Katastralgemeinden bestehen. Jeder Katastralgemeinde ist eine Katastralgemeindenummer (KG-NR) zugeordnet, die immer aus genau 5 Ziffern besteht.",
  },
  {
    question: "Was ist die Einlagezahl?",
    answer:
      "Über die Einlagezahl (EZ) und der Katastralgemeinde (KG) wird eine Grundbuchseinlage eindeutig im Grundbuch definiert. Eine Einlage kann aus mehreren Grundstücksnummern bestehen. Die Einlagezahl ist immer auf der ersten Seite des Grundbuchsauszugs rechts oben ersichtlich.",
  },
  {
    question: "Sind meine Daten sicher?",
    answer:
      "Ja, Ihre Daten werden vertraulich behandelt und gemäß den geltenden Datenschutzbestimmungen (DSGVO) verarbeitet. Wir verwenden sichere Verschlüsselungstechnologien und geben Ihre Daten nicht an unbefugte Dritte weiter.",
  },
];

export default function FAQ() {
  return (
    <Layout>
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Häufig gestellte Fragen
            </h1>
            <p className="text-lg text-muted-foreground mb-12">
              Hier finden Sie Antworten auf die wichtigsten Fragen rund um den Grundbuchauszug.
            </p>

            <Accordion type="single" collapsible className="w-full mb-12">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left font-medium hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="bg-info p-6 rounded border text-center">
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Weitere Fragen?
              </h2>
              <p className="text-muted-foreground mb-4">
                Kontaktieren Sie uns – wir helfen Ihnen gerne weiter.
              </p>
              <Button asChild>
                <Link to="/kontakt" className="hover:no-underline">
                  Kontakt
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
