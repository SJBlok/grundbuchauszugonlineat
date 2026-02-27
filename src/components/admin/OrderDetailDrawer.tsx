import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import {
  User, Mail, MapPin, FileText, Euro, Clock, Building, Zap, HardDrive,
  Copy, Check, Save, Upload, Trash2, ExternalLink, ArrowLeft, Play,
  Loader2, CheckCircle2, AlertCircle, Download, Lock,
} from "lucide-react";
import { useAdminTheme } from "@/pages/Admin";
import { useToast } from "@/hooks/use-toast";

interface Props {
  order: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateOrder: (orderId: string, updates: Record<string, unknown>) => Promise<void>;
  onRefresh: () => void;
}

const STATUS_OPTIONS = [
  { value: "open", label: "Offen", description: "Neue Bestellung, noch nicht bearbeitet" },
  { value: "awaiting_customer", label: "Warte auf Kunde", description: "Rückfrage an den Kunden gesendet" },
  { value: "processed", label: "Verarbeitet", description: "Grundbuchauszug erstellt und versendet" },
  { value: "cancelled", label: "Storniert", description: "Bestellung wurde storniert" },
];

const PAYMENT_OPTIONS = [
  { value: "pending", label: "Ausstehend" },
  { value: "paid", label: "Bezahlt" },
  { value: "failed", label: "Fehlgeschlagen" },
  { value: "refunded", label: "Erstattet" },
];

const STATUS_COLORS: Record<string, { dark: string; light: string }> = {
  open: { dark: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30", light: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  pending: { dark: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30", light: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  awaiting_customer: { dark: "bg-orange-500/15 text-orange-400 border-orange-500/30", light: "bg-orange-50 text-orange-700 border-orange-200" },
  processed: { dark: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", light: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  completed: { dark: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", light: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  cancelled: { dark: "bg-red-500/15 text-red-400 border-red-500/30", light: "bg-red-50 text-red-700 border-red-200" },
};

export function OrderDetailDrawer({ order, open, onOpenChange, onUpdateOrder, onRefresh }: Props) {
  const { isDark: d } = useAdminTheme();
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState("");
  const [documents, setDocuments] = useState<any[]>([]);

  // UVST state
  const [uvstLoading, setUvstLoading] = useState(false);
  const [uvstResult, setUvstResult] = useState<any>(null);
  const [uvstError, setUvstError] = useState<string | null>(null);

  useEffect(() => {
    if (order) {
      setNotes(order.processing_notes || "");
      try { setDocuments(Array.isArray(order.documents) ? order.documents : []); } catch { setDocuments([]); }
      setUvstResult(null);
      setUvstError(null);
    }
  }, [order]);

  if (!order) return null;

  const fmtDate = (s: string) => new Date(s).toLocaleDateString("de-AT", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const fmtCur = (n: number) => new Intl.NumberFormat("de-AT", { style: "currency", currency: "EUR" }).format(n);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const handleStatusChange = async (newStatus: string) => {
    setSaving(true);
    await onUpdateOrder(order.id, { status: newStatus });
    setSaving(false);
    toast({ title: "Status geändert", description: STATUS_OPTIONS.find(s => s.value === newStatus)?.label });
  };

  const handlePaymentChange = async (newStatus: string) => {
    setSaving(true);
    await onUpdateOrder(order.id, { payment_status: newStatus });
    setSaving(false);
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    await onUpdateOrder(order.id, { processing_notes: notes });
    setSaving(false);
    toast({ title: "Notizen gespeichert" });
  };

  const handleRemoveDocument = async (index: number) => {
    const updated = documents.filter((_: any, i: number) => i !== index);
    setDocuments(updated);
    await onUpdateOrder(order.id, { documents: updated });
  };

  // UVST Grundbuch Abfrage
  const handleUvstAbfrage = async () => {
    setUvstLoading(true);
    setUvstError(null);
    setUvstResult(null);
    try {
      // Step 1: Authenticate
      const authRes = await supabase.functions.invoke("uvst-proxy", {
        body: { action: "authenticate", environment: "prod" },
      });
      if (authRes.error || !authRes.data?.success) {
        throw new Error(authRes.error?.message || "UVST Authentifizierung fehlgeschlagen");
      }
      const token = authRes.data.data.accessToken;

      // Step 2: Grundbuch Abfrage
      const abfrageRes = await supabase.functions.invoke("uvst-proxy", {
        body: {
          action: "grundbuchAbfrage",
          environment: "prod",
          data: {
            token,
            kgNummer: order.katastralgemeinde,
            einlagezahl: order.grundstuecksnummer,
            format: "pdf",
            historisch: false,
            signiert: false,
            linked: true,
            produkt: "GT_GBA",
          },
        },
      });

      if (abfrageRes.error || !abfrageRes.data?.success) {
        throw new Error(abfrageRes.error?.message || "Grundbuch Abfrage fehlgeschlagen");
      }

      setUvstResult(abfrageRes.data.data);
      toast({ title: "Grundbuchauszug erfolgreich abgerufen" });

      // Auto-update status to processed
      await onUpdateOrder(order.id, { status: "processed" });
    } catch (err: any) {
      setUvstError(err.message);
      toast({ title: "UVST Fehler", description: err.message, variant: "destructive" });
    } finally {
      setUvstLoading(false);
    }
  };

  const sc = STATUS_COLORS[order.status] || STATUS_COLORS.open;

  const InfoItem = ({ label, value, copyable, mono }: { label: string; value: string | null | undefined; copyable?: boolean; mono?: boolean }) => (
    <div className="space-y-0.5">
      <div className={`text-[11px] uppercase tracking-wider ${d ? "text-slate-500" : "text-gray-400"}`}>{label}</div>
      <div className="flex items-center gap-1.5">
        <span className={`text-sm ${mono ? "font-mono" : ""} ${d ? "text-slate-200" : "text-gray-800"}`}>{value || "—"}</span>
        {copyable && value && (
          <button onClick={() => copyText(value, label)} className={`${d ? "text-slate-600 hover:text-slate-400" : "text-gray-300 hover:text-gray-500"}`}>
            {copied === label ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-5xl max-h-[90vh] overflow-y-auto p-0 gap-0 ${d ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-gray-50 border-gray-200 text-gray-900"}`}>
        {/* Header */}
        <div className={`sticky top-0 z-10 px-6 py-4 border-b ${d ? "bg-slate-950 border-slate-800" : "bg-white border-gray-200"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}
                className={`h-8 w-8 p-0 ${d ? "text-slate-400 hover:bg-slate-800" : "text-gray-500 hover:bg-gray-100"}`}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-lg font-semibold ${d ? "text-slate-100" : "text-gray-900"}`}>{order.order_number}</span>
                  <Badge variant="outline" className={d ? sc.dark : sc.light}>
                    {STATUS_OPTIONS.find(s => s.value === order.status)?.label || order.status}
                  </Badge>
                </div>
                <span className={`text-xs ${d ? "text-slate-500" : "text-gray-400"}`}>{fmtDate(order.created_at)}</span>
              </div>
            </div>
            <span className={`text-2xl font-semibold ${d ? "text-slate-100" : "text-gray-900"}`}>{fmtCur(order.product_price)}</span>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Row 1: Status + Payment controls */}
          <div className="grid grid-cols-3 gap-4">
            <Card className={d ? "bg-slate-900/50 border-slate-800" : "bg-white border-gray-200"}>
              <CardContent className="pt-4 pb-4 space-y-2">
                <p className={`text-xs font-medium ${d ? "text-slate-400" : "text-gray-500"}`}>Status ändern</p>
                <Select value={order.status} onValueChange={handleStatusChange} disabled={saving}>
                  <SelectTrigger className={`h-9 ${d ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-gray-50 border-gray-200"}`}><SelectValue /></SelectTrigger>
                  <SelectContent className={d ? "bg-slate-800 border-slate-700" : ""}>
                    {STATUS_OPTIONS.map(o => (
                      <SelectItem key={o.value} value={o.value}>
                        <div>
                          <p className="text-sm font-medium">{o.label}</p>
                          <p className={`text-xs ${d ? "text-slate-500" : "text-gray-400"}`}>{o.description}</p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
            <Card className={d ? "bg-slate-900/50 border-slate-800" : "bg-white border-gray-200"}>
              <CardContent className="pt-4 pb-4 space-y-2">
                <p className={`text-xs font-medium ${d ? "text-slate-400" : "text-gray-500"}`}>Zahlungsstatus</p>
                <Select value={order.payment_status} onValueChange={handlePaymentChange} disabled={saving}>
                  <SelectTrigger className={`h-9 ${d ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-gray-50 border-gray-200"}`}><SelectValue /></SelectTrigger>
                  <SelectContent className={d ? "bg-slate-800 border-slate-700" : ""}>
                    {PAYMENT_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
            <Card className={d ? "bg-slate-900/50 border-slate-800" : "bg-white border-gray-200"}>
              <CardContent className="pt-4 pb-4 space-y-2">
                <p className={`text-xs font-medium ${d ? "text-slate-400" : "text-gray-500"}`}>Extras</p>
                <div className="space-y-1">
                  {order.fast_delivery && <p className="text-sm flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-400" />Express-Lieferung</p>}
                  {order.digital_storage_subscription && <p className="text-sm flex items-center gap-1.5"><HardDrive className="w-3.5 h-3.5 text-blue-400" />Digitale Speicherung</p>}
                  {!order.fast_delivery && !order.digital_storage_subscription && <span className={`text-sm ${d ? "text-slate-500" : "text-gray-400"}`}>Keine Extras</span>}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Row 2: Customer + Property info side by side */}
          <div className="grid grid-cols-2 gap-4">
            <Card className={d ? "bg-slate-900/50 border-slate-800" : "bg-white border-gray-200"}>
              <CardHeader className="pb-3">
                <CardTitle className={`text-sm font-medium flex items-center gap-2 ${d ? "text-slate-300" : "text-gray-600"}`}>
                  <User className="w-4 h-4" /> Kundendaten
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoItem label="Name" value={`${order.vorname} ${order.nachname}`} />
                <InfoItem label="E-Mail" value={order.email} copyable />
                {order.firma && <InfoItem label="Firma" value={order.firma} />}
                <InfoItem label="Adresse" value={[order.adresse, [order.plz, order.ort].filter(Boolean).join(" "), order.wohnsitzland].filter(Boolean).join(", ")} />
              </CardContent>
            </Card>

            <Card className={d ? "bg-slate-900/50 border-slate-800" : "bg-white border-gray-200"}>
              <CardHeader className="pb-3">
                <CardTitle className={`text-sm font-medium flex items-center gap-2 ${d ? "text-slate-300" : "text-gray-600"}`}>
                  <MapPin className="w-4 h-4" /> Grundstückdaten
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoItem label="Produkt" value={order.product_name} />
                <InfoItem label="Bundesland" value={order.bundesland} />
                <InfoItem label="Grundbuchsgericht" value={order.grundbuchsgericht} />
                <div className="grid grid-cols-2 gap-3">
                  <InfoItem label="KG-Nummer" value={order.katastralgemeinde} copyable mono />
                  <InfoItem label="Einlagezahl (EZ)" value={order.grundstuecksnummer} copyable mono />
                </div>
                {order.wohnungs_hinweis && <InfoItem label="Wohnungshinweis" value={order.wohnungs_hinweis} />}
              </CardContent>
            </Card>
          </div>

          {/* Row 3: UVST Grundbuch Verarbeitung */}
          <Card className={d ? "bg-slate-900/50 border-slate-800" : "bg-white border-gray-200"}>
            <CardHeader className="pb-3">
              <CardTitle className={`text-sm font-medium flex items-center gap-2 ${d ? "text-slate-300" : "text-gray-600"}`}>
                <Play className="w-4 h-4" /> Grundbuch Verarbeitung (UVST)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className={`text-xs ${d ? "text-slate-500" : "text-gray-400"}`}>
                Grundbuchauszug über die UVST Schnittstelle abrufen. Verwendet KG-Nr. <span className="font-mono">{order.katastralgemeinde}</span> und EZ <span className="font-mono">{order.grundstuecksnummer}</span>.
              </p>

              <div className="flex items-center gap-3">
                <Button onClick={handleUvstAbfrage} disabled={uvstLoading} size="sm" className="gap-1.5">
                  {uvstLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  Grundbuchauszug abrufen
                </Button>
                {order.status === "processed" && (
                  <span className="flex items-center gap-1 text-xs text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Bereits verarbeitet
                  </span>
                )}
              </div>

              {uvstError && (
                <div className={`flex items-start gap-2 p-3 rounded-lg ${d ? "bg-red-500/10 border border-red-500/20" : "bg-red-50 border border-red-200"}`}>
                  <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-400">UVST Fehler</p>
                    <p className={`text-xs ${d ? "text-red-400/70" : "text-red-600"}`}>{uvstError}</p>
                  </div>
                </div>
              )}

              {uvstResult && (
                <div className={`flex items-center justify-between p-3 rounded-lg ${d ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-emerald-50 border border-emerald-200"}`}>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm">Grundbuchauszug erfolgreich abgerufen</span>
                  </div>
                  {uvstResult.pdfBase64 && (
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => {
                      const link = document.createElement("a");
                      link.href = `data:application/pdf;base64,${uvstResult.pdfBase64}`;
                      link.download = `Grundbuchauszug_${order.order_number}.pdf`;
                      link.click();
                    }}>
                      <Download className="w-3.5 h-3.5" />
                      PDF herunterladen
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Row 4: Notes + Documents side by side */}
          <div className="grid grid-cols-2 gap-4">
            <Card className={d ? "bg-slate-900/50 border-slate-800" : "bg-white border-gray-200"}>
              <CardHeader className="pb-3">
                <CardTitle className={`text-sm font-medium flex items-center gap-2 ${d ? "text-slate-300" : "text-gray-600"}`}>
                  <Save className="w-4 h-4" /> Verarbeitungsnotizen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notizen zur Bearbeitung..." rows={5}
                  className={d ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-gray-50 border-gray-200"} />
                <Button onClick={handleSaveNotes} disabled={saving || notes === (order.processing_notes || "")} size="sm" className="gap-1">
                  <Save className="w-3.5 h-3.5" />Speichern
                </Button>
              </CardContent>
            </Card>

            <Card className={d ? "bg-slate-900/50 border-slate-800" : "bg-white border-gray-200"}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className={`text-sm font-medium flex items-center gap-2 ${d ? "text-slate-300" : "text-gray-600"}`}>
                    <Upload className="w-4 h-4" /> Dokumente
                  </CardTitle>
                  <span className={`text-xs ${d ? "text-slate-500" : "text-gray-400"}`}>{documents.length} Datei{documents.length !== 1 ? "en" : ""}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className={`flex items-center justify-between p-3 rounded-lg ${d ? "bg-slate-800/50" : "bg-gray-50"}`}>
                  <div>
                    <p className={`text-sm font-medium ${d ? "text-slate-200" : "text-gray-700"}`}>Sichtbar für Kunden</p>
                    <p className={`text-[11px] ${d ? "text-slate-500" : "text-gray-400"}`}>
                      {order.digital_storage_subscription
                        ? "Kunde hat Digitale Speicherung gebucht"
                        : "Keine Digitale Speicherung gebucht"}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={order.document_visible ? "default" : "outline"}
                    onClick={async () => {
                      await onUpdateOrder(order.id, { document_visible: !order.document_visible });
                    }}
                    disabled={!order.digital_storage_subscription}
                    className="gap-1"
                  >
                    {order.document_visible ? (
                      <><CheckCircle2 className="w-3.5 h-3.5" /> Sichtbar</>
                    ) : (
                      <><Lock className="w-3.5 h-3.5" /> Verborgen</>
                    )}
                  </Button>
                </div>
                <Separator className={d ? "bg-slate-800" : "bg-gray-100"} />
                {documents.length === 0 ? (
                  <div className={`text-center py-6 text-sm ${d ? "text-slate-500" : "text-gray-400"}`}>Noch keine Dokumente</div>
                ) : documents.map((doc: any, i: number) => (
                  <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg ${d ? "bg-slate-800/50" : "bg-gray-50"}`}>
                    <FileText className={`w-4 h-4 shrink-0 ${d ? "text-slate-400" : "text-gray-400"}`} />
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm truncate ${d ? "text-slate-200" : "text-gray-800"}`}>{doc.name}</div>
                    </div>
                    {doc.url && <a href={doc.url} target="_blank" rel="noopener noreferrer" className={d ? "text-slate-400 hover:text-slate-200" : "text-gray-400 hover:text-gray-600"}><ExternalLink className="w-3.5 h-3.5" /></a>}
                    <button onClick={() => handleRemoveDocument(i)} className="text-red-400 hover:text-red-300"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Row 5: Metadata */}
          <div className={`flex items-center gap-6 text-xs px-1 ${d ? "text-slate-500" : "text-gray-400"}`}>
            <span>Erstellt: {fmtDate(order.created_at)}</span>
            <span>Aktualisiert: {fmtDate(order.updated_at)}</span>
            {order.moneybird_invoice_id && <span>Moneybird: {order.moneybird_invoice_id}</span>}
            <span className="font-mono">{order.id}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
