import { Layout } from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

const lexikonEntries = [
  {
    id: "bezirksgericht",
    title: "Bezirksgericht",
    content: "In den Bezirksgerichten wird unter anderem das Grundbuch und die zugehörige Urkundensammlung verwaltet. Das zuständige Bezirksgericht ist von der jeweiligen Katastralgemeinde abhängig. Es ist in der zweiten Zeile eines jeden Grundbuchauszugs vermerkt.",
  },
  {
    id: "einlagezahl",
    title: "Einlagezahl",
    content: "Über die Einlagezahl (EZ) und der Katastralgemeinde (KG) wird eine Grundbuchseinlage eindeutig im Grundbuch definiert. Eine Einlage kann aus mehreren Grundstücksnummern bestehen. Die Einlagezahl besteht lediglich aus Ziffern und ist immer auf der ersten Seite des Grundbuchsauszugs rechts oben ersichtlich.",
  },
  {
    id: "grundbuchseinlage",
    title: "Grundbuchseinlage / Grundbuchskörper",
    content: "Eine Grundbuchseinlage bzw. Grundbuchskörper bezeichnet im Grundbuch eine Liegenschaft. Eine Grundbuchseinlage kann über einen Auszug abgefragt werden (Grundbuchauszug). Eine Grundbuchseinlage wird eindeutig über die Katastralgemeinde und der Einlagezahl definiert.",
  },
  {
    id: "grundstuecksnummer",
    title: "Grundstücksnummer",
    content: "Über die Grundstücksnummer (GST-NR) und der Katastralgemeinde (KG) wird ein Grundstück eindeutig im Grundbuch definiert. Pro Katastralgemeinde ist jede Grundstücksnummer nur einmal vergeben. Die Grundstücksnummern sind auf der ersten Seite des Grundbuchsauszugs in der Abteilung A1 ersichtlich.",
  },
  {
    id: "katastralgemeinde",
    title: "Katastralgemeinde",
    content: "Eine Katastralgemeinde (KG) ist Teil einer Gemeinde, das heißt Gemeinden können aus mehreren Katastralgemeinden bestehen. Jeder Katastralgemeinde ist eine Katastralgemeindenummer (KG-NR) zugeordnet, die immer aus genau 5 Ziffern besteht. Grundstücke sind immer genau einer Katastralgemeinde zugeordnet.",
  },
  {
    id: "kaufvertrag",
    title: "Kaufvertrag",
    content: "Wurde eine Liegenschaft verkauft (anstatt z.B. vererbt oder geschenkt), ist im B-Blatt des Grundbuchauszugs die laufende Nummer plus das Jahr und das Kaufvertragsdatum vermerkt. Die Tagebuchzahl und das Jahr wird benötigt um den Kaufvertrag online in der Urkundensammlung einsehen zu können.",
  },
  {
    id: "pfandrecht",
    title: "Pfandrecht",
    content: "Ist eine Liegenschaft mit einem Pfandrecht belastet, ist dies im C-Blatt des Grundbuchauszugs ersichtlich. Ein Pfandrecht wird in der Regel eingetragen, wenn der Liegenschaftsbesitzer einen Kredit aufnimmt. Das Pfandrecht dient als Besicherung der Bank. Dabei wird ein Höchstbetrag festgelegt, der sich aus der Kreditsumme plus Kreditnebenkosten zusammensetzt.",
  },
  {
    id: "tagebuchzahl",
    title: "Tagebuchzahl",
    content: "Die Tagebuchzahl (TZ) besteht aus einer laufenden Nummer und einer Jahreszahl. Einer Tagebuchzahl können ein oder mehrere Dokumente zugeordnet werden. Mit der Bezirksgerichtsnummer und der Tagebuchzahl können online Urkunden ab dem Jahr 2006 angefordert werden.",
  },
  {
    id: "vorkaufsrecht",
    title: "Vorkaufsrecht",
    content: "Ein Vorkaufsrecht ist im B-Blatt des Grundbuchs unter dem Eigentümer eingetragen. Es begünstigt eine Person, die Liegenschaft bei Verkaufsabsicht des Eigentümers zu kaufen. Dem Vorkaufsrechtsbegünstigten ist ein Angebot eines Dritten vorzulegen, er kann dann innerhalb von 30 Tagen zu denselben Konditionen das Vorkaufsrecht ausüben.",
  },
  {
    id: "wohnungseigentum",
    title: "Wohnungseigentum",
    content: "Wohnungseigentum bezeichnet das dingliche Recht eine Wohnung, eine sonstige selbstständige Räumlichkeit (wie z.B. Lager, Geschäftslokal) oder einen Kfz-Stellplatz zu nutzen und darüber allein zu verfügen. Als Wohnungseigentümer ist man automatisch Miteigentümer einer Liegenschaft, der über einen ideellen Anteil der Liegenschaft verfügt.",
  },
];

export default function Lexikon() {
  return (
    <Layout>
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Grundbuch-Lexikon
            </h1>
            <p className="text-lg text-muted-foreground mb-12">
              Erklärung der Begriffe in einem Grundbuchauszug
            </p>

            <div className="space-y-8">
              {lexikonEntries.map((entry) => (
                <div key={entry.id} id={entry.id} className="scroll-mt-24">
                  <div className="bg-info p-6 rounded border-l-4 border-primary">
                    <h2 className="text-xl font-semibold text-foreground mb-3">
                      {entry.title}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {entry.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 bg-muted p-6 rounded text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Grundbuchauszug anfordern
              </h3>
              <p className="text-muted-foreground mb-4">
                Fordern Sie jetzt Ihren Grundbuchauszug online an.
              </p>
              <Button asChild>
                <Link to="/anfordern" className="hover:no-underline">
                  Jetzt anfordern
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
