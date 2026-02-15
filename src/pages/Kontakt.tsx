import { Layout } from "@/components/layout/Layout";
import { Mail, MapPin, Globe } from "lucide-react";

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
                    <a href="mailto:info@grundbuchauszugonline.at" className="text-primary hover:underline">
                      info@grundbuchauszugonline.at
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-info p-6 rounded-lg">
                <div className="flex items-start gap-4">
                  <Globe className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-2">
                      Website
                    </h2>
                    <a href="https://grundbuchauszugonline.at" className="text-primary hover:underline">
                      grundbuchauszugonline.at
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-info p-6 rounded-lg">
                <div className="flex items-start gap-4">
                  <MapPin className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-2">
                      Unternehmen
                    </h2>
                    <p className="text-muted-foreground">
                      Tophallen Bouw B.V.<br />
                      Kerkweg 1a, Stavenisse<br />
                      Handelsregisternummer (KVK): 87289792
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
                Bitte beachten Sie, dass wir keine telefonische Beratung anbieten. Anfragen werden ausschließlich per E-Mail bearbeitet. Wir beantworten Anfragen in der Regel werktags innerhalb von 24–48 Stunden.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
