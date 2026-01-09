import { Layout } from "@/components/layout/Layout";
import { Mail, MapPin } from "lucide-react";

export default function Kontakt() {
  return (
    <Layout>
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Kontakt
            </h1>
            <p className="text-lg text-muted-foreground mb-12">
              Bei Fragen zu Ihrer Bestellung oder unserem Service können Sie uns gerne kontaktieren.
            </p>

            <div className="space-y-6">
              <div className="bg-info p-6 rounded-lg">
                <div className="flex items-start gap-4">
                  <Mail className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-2">
                      E-Mail
                    </h2>
                    <p className="text-muted-foreground">
                      kontakt@grundbuchauszugonline.at
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-info p-6 rounded-lg">
                <div className="flex items-start gap-4">
                  <MapPin className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-2">
                      Anschrift
                    </h2>
                    <p className="text-muted-foreground">
                      Application Assistant Ltd<br />
                      Weitere Adressangaben im Impressum
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 p-6 bg-muted rounded-lg">
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Hinweis
              </h2>
              <p className="text-muted-foreground">
                Bitte beachten Sie, dass wir keine telefonische Beratung anbieten. Anfragen werden ausschließlich per E-Mail bearbeitet. Wir bemühen uns, Ihre Anfrage innerhalb von 24 Stunden zu beantworten.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
