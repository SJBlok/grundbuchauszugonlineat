import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText, Download, Search, ShieldCheck, Lock, CheckCircle2, AlertCircle, Loader2, ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";

export default function MeineDokumente() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOrder(null);
    setSearched(true);

    if (!orderNumber.trim() || !email.trim()) {
      setError("Bitte geben Sie Ihre Bestellnummer und E-Mail-Adresse ein.");
      return;
    }

    setLoading(true);
    try {
      const { data, error: dbError } = await supabase
        .from("orders")
        .select("order_number, email, vorname, nachname, product_name, katastralgemeinde, grundstuecksnummer, bundesland, digital_storage_subscription, document_visible, documents, status, created_at")
        .eq("order_number", orderNumber.trim().toUpperCase())
        .eq("email", email.trim().toLowerCase())
        .maybeSingle();

      if (dbError) throw dbError;

      if (!data) {
        setError("Keine Bestellung mit dieser Kombination gefunden. Bitte überprüfen Sie Ihre Bestellnummer und E-Mail-Adresse.");
        return;
      }

      setOrder(data);
    } catch (err: any) {
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const documents = order?.documents && Array.isArray(order.documents) ? order.documents : [];
  const hasDigitalStorage = order?.digital_storage_subscription === true;
  const isVisible = order?.document_visible === true;
  const canDownload = hasDigitalStorage && isVisible && documents.length > 0;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Meine Dokumente</h1>
            <p className="text-muted-foreground mt-2">
              Geben Sie Ihre Bestellnummer und E-Mail-Adresse ein, um Ihren Grundbuchauszug herunterzuladen.
            </p>
          </div>

          {/* Search Form */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Bestellnummer</label>
                  <Input
                    placeholder="z.B. GB-100123"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="text-base"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">E-Mail-Adresse</label>
                  <Input
                    type="email"
                    placeholder="ihre@email.at"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-base"
                  />
                </div>
                <Button type="submit" className="w-full gap-2" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Dokumente suchen
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Error */}
          {error && (
            <Card className="mb-6 border-destructive/30 bg-destructive/5">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Found */}
          {order && (
            <div className="space-y-4">
              {/* Order Info */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-mono">{order.order_number}</CardTitle>
                    <Badge variant={order.status === "processed" || order.status === "completed" ? "default" : "secondary"}>
                      {order.status === "processed" || order.status === "completed" ? "Verarbeitet" : "In Bearbeitung"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wider">Produkt</p>
                      <p className="font-medium text-foreground">{order.product_name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wider">Grundstück</p>
                      <p className="font-medium text-foreground">KG {order.katastralgemeinde} / EZ {order.grundstuecksnummer}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wider">Bundesland</p>
                      <p className="font-medium text-foreground">{order.bundesland}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wider">Bestellt am</p>
                      <p className="font-medium text-foreground">{new Date(order.created_at).toLocaleDateString("de-AT", { day: "numeric", month: "long", year: "numeric" })}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Document Download Section */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    {canDownload ? <Download className="w-5 h-5 text-primary" /> : <Lock className="w-5 h-5 text-muted-foreground" />}
                    Dokumente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!hasDigitalStorage ? (
                    <div className="text-center py-6">
                      <Lock className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                      <p className="font-medium text-foreground">Digitale Speicherung ist nicht aktiviert</p>
                      <p className="text-sm text-muted-foreground mt-1">Bei Ihrer Bestellung wurde die Option "Digitale Speicherung" nicht gewählt. Kontaktieren Sie uns, wenn Sie diese nachträglich aktivieren möchten.</p>
                    </div>
                  ) : !isVisible ? (
                    <div className="text-center py-6">
                      <Loader2 className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                      <p className="font-medium text-foreground">Ihr Dokument wird noch vorbereitet</p>
                      <p className="text-sm text-muted-foreground mt-1">Sobald Ihr Grundbuchauszug fertig ist, können Sie ihn hier herunterladen. Sie erhalten eine E-Mail-Benachrichtigung.</p>
                    </div>
                  ) : documents.length === 0 ? (
                    <div className="text-center py-6">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                      <p className="font-medium text-foreground">Noch keine Dokumente verfügbar</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {documents.map((doc: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <FileText className="w-5 h-5 text-primary shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate text-foreground">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(doc.added_at).toLocaleDateString("de-AT")}
                            </p>
                          </div>
                          {doc.url && (
                            <a href={doc.url} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" className="gap-1.5">
                                <Download className="w-3.5 h-3.5" />
                                Herunterladen
                              </Button>
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Security Note */}
              <div className="flex items-start gap-3 text-xs text-muted-foreground px-1">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  Ihre Dokumente werden sicher gespeichert und sind nur mit der korrekten Bestellnummer und E-Mail-Adresse zugänglich.
                </p>
              </div>
            </div>
          )}

          {/* No results after search */}
          {searched && !order && !error && !loading && (
            <Card className="text-center py-8">
              <CardContent>
                <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-40" />
                <p className="text-sm text-muted-foreground">Keine Ergebnisse</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
