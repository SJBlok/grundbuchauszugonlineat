import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  const [uvstLoading, setUvstLoading] = useState(false);
  const [uvstResult, setUvstResult] = useState<any>(null);
  const [uvstError, setUvstError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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

  const handleUploadDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !order) return;
    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const formData = new FormData();
      formData.append("file", file);
      formData.append("order_id", order.id);
      formData.append("order_number", order.order_number);
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-order-document`,
        {
          method: "POST",
          headers: {
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Authorization": `Bearer ${session?.access_token}`,
          },
          body: formData,
        }
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDocuments([...documents, data.document]);
      toast({ title: "Dokument hochgeladen", description: file.name });
      onRefresh();
    } catch (err: any) {
      toast({ title: "Upload fehlgeschlagen", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleUvstAbfrage = async () => {
    setUvstLoading(true);
    setUvstError(null);
    setUvstResult(null);
    try {
      const authRes = await supabase.functions.invoke("uvst-proxy", {
        body: { action: "authenticate", environment: "prod" },
      });
      if (authRes.error || !authRes.data?.success) throw new Error(authRes.error?.message || "UVST Authentifizierung fehlgeschlagen");
      const token = authRes.data.data.accessToken;
      const abfrageRes = await supabase.functions.invoke("uvst-proxy", {
        body: {
          action: "grundbuchAbfrage", environment: "prod",
          data: { token, kgNummer: order.katastralgemeinde, einlagezahl: order.grundstuecksnummer, format: "pdf", historisch: false, signiert: false, linked: true, produkt: "GT_GBA" },
        },
      });
      if (abfrageRes.error || !abfrageRes.data?.success) throw new Error(abfrageRes.error?.message || "Grundbuch Abfrage fehlgeschlagen");
      setUvstResult(abfrageRes.data.data);
      toast({ title: "Grundbuchauszug erfolgreich abgerufen" });
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
    <div>
      <div className={`text-[11px] uppercase tracking-wider font-medium mb-1 ${d ? "text-slate-500" : "text-muted-foreground/60"}`}>{label}</div>
      <div className="flex items-center gap-1.5">
        <span className={`text-[15px] leading-snug ${mono ? "font-mono" : ""} ${d ? "text-slate-200" : "text-foreground"}`}>{value || "—"}</span>
        {copyable && value && (
          <button onClick={() => copyText(value, label)} className={`opacity-40 hover:opacity-80 transition-opacity`}>
            {copied === label ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
          </button>
        )}
      </div>
    </div>
  );

  // Shared section card styling
  const sectionCard = `rounded-xl border ${d ? "bg-slate-900/40 border-slate-800/80" : "bg-white border-border/50"} shadow-sm`;
  const sectionTitle = `text-base font-semibold flex items-center gap-2.5 ${d ? "text-slate-200" : "text-foreground"}`;
  const sectionIcon = `w-[18px] h-[18px] ${d ? "text-slate-400" : "text-muted-foreground/70"}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-5xl max-h-[92vh] overflow-y-auto p-0 gap-0 rounded-xl ${d ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-muted/30 border-border text-foreground"}`}>

        {/* ─── Header ─── */}
        <div className={`sticky top-0 z-10 px-8 py-5 border-b ${d ? "bg-slate-950/95 border-slate-800 backdrop-blur" : "bg-white/95 border-border/50 backdrop-blur"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => onOpenChange(false)}
                className={`h-9 w-9 rounded-full flex items-center justify-center border transition-colors ${d ? "border-slate-700 hover:bg-slate-800 text-slate-400" : "border-border hover:bg-accent text-muted-foreground"}`}>
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center gap-2.5">
                  <span className={`font-mono text-xl font-bold tracking-tight ${d ? "text-slate-50" : "text-foreground"}`}>{order.order_number}</span>
                  <Badge variant="outline" className={`text-xs font-medium ${d ? sc.dark : sc.light}`}>
                    {STATUS_OPTIONS.find(s => s.value === order.status)?.label || order.status}
                  </Badge>
                </div>
                <span className={`text-[13px] ${d ? "text-slate-500" : "text-muted-foreground"}`}>{fmtDate(order.created_at)}</span>
              </div>
            </div>
            <span className={`text-2xl font-bold tracking-tight ${d ? "text-slate-50" : "text-foreground"}`}>{fmtCur(order.product_price)}</span>
          </div>
        </div>

        <div className="p-8 space-y-6">

          {/* ─── Row 1: Status / Payment / Extras ─── */}
          <div className={`grid grid-cols-3 gap-px rounded-xl overflow-hidden border ${d ? "bg-slate-800/50 border-slate-800/80" : "bg-border/30 border-border/50"}`}>
            {[
              {
                label: "Status ändern",
                content: (
                  <Select value={order.status} onValueChange={handleStatusChange} disabled={saving}>
                    <SelectTrigger className={`h-10 mt-1.5 ${d ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-muted/50 border-border"}`}><SelectValue /></SelectTrigger>
                    <SelectContent className={d ? "bg-slate-800 border-slate-700" : ""}>
                      {STATUS_OPTIONS.map(o => (
                        <SelectItem key={o.value} value={o.value}>
                          <div>
                            <p className="text-sm font-medium">{o.label}</p>
                            <p className={`text-xs ${d ? "text-slate-500" : "text-muted-foreground"}`}>{o.description}</p>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ),
              },
              {
                label: "Zahlungsstatus",
                content: (
                  <Select value={order.payment_status} onValueChange={handlePaymentChange} disabled={saving}>
                    <SelectTrigger className={`h-10 mt-1.5 ${d ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-muted/50 border-border"}`}><SelectValue /></SelectTrigger>
                    <SelectContent className={d ? "bg-slate-800 border-slate-700" : ""}>
                      {PAYMENT_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ),
              },
              {
                label: "Extras",
                content: (
                  <div className="mt-2 space-y-1.5">
                    {order.fast_delivery && <p className="text-sm flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-amber-500" />Express-Lieferung</p>}
                    {order.digital_storage_subscription && <p className="text-sm flex items-center gap-2"><HardDrive className="w-3.5 h-3.5 text-blue-500" />Digitale Speicherung</p>}
                    {!order.fast_delivery && !order.digital_storage_subscription && <span className={`text-sm ${d ? "text-slate-500" : "text-muted-foreground"}`}>Keine Extras</span>}
                  </div>
                ),
              },
            ].map((cell, i) => (
              <div key={i} className={`px-6 py-5 ${d ? "bg-slate-900/60" : "bg-white"}`}>
                <p className={`text-xs font-medium tracking-wide ${d ? "text-slate-400" : "text-muted-foreground"}`}>{cell.label}</p>
                {cell.content}
              </div>
            ))}
          </div>

          {/* ─── Row 2: Kundendaten + Grundstückdaten ─── */}
          <div className="grid grid-cols-2 gap-6">
            <div className={sectionCard}>
              <div className="px-7 pt-6 pb-2">
                <h3 className={sectionTitle}><User className={sectionIcon} /> Kundendaten</h3>
              </div>
              <div className="px-7 pb-7 space-y-4 pt-4">
                <InfoItem label="Name" value={`${order.vorname} ${order.nachname}`} />
                <InfoItem label="E-Mail" value={order.email} copyable />
                {order.firma && <InfoItem label="Firma" value={order.firma} />}
              </div>
            </div>

            <div className={sectionCard}>
              <div className="px-7 pt-6 pb-2">
                <h3 className={sectionTitle}><MapPin className={sectionIcon} /> Grundstückdaten</h3>
              </div>
              <div className="px-7 pb-7 space-y-4 pt-4">
                <InfoItem label="Produkt" value={order.product_name} />
                <InfoItem label="Bundesland" value={order.bundesland} />
                <InfoItem label="Grundbuchsgericht" value={order.grundbuchsgericht} />
                <div className="grid grid-cols-2 gap-6">
                  <InfoItem label="KG-Nummer" value={order.katastralgemeinde} copyable mono />
                  <InfoItem label="Einlagezahl (EZ)" value={order.grundstuecksnummer} copyable mono />
                </div>
                {order.wohnungs_hinweis && <InfoItem label="Wohnungshinweis" value={order.wohnungs_hinweis} />}
                <InfoItem label="Adresse" value={[order.adresse, [order.plz, order.ort].filter(Boolean).join(" "), order.wohnsitzland].filter(Boolean).join(", ")} />
              </div>
            </div>
          </div>

          {/* ─── Row 3: UVST Grundbuch Verarbeitung ─── */}
          <div className={sectionCard}>
            <div className="px-7 pt-6 pb-2">
              <h3 className={sectionTitle}><Play className={sectionIcon} /> Grundbuch Verarbeitung (UVST)</h3>
            </div>
            <div className="px-7 pb-7 pt-3 space-y-4">
              <p className={`text-sm leading-relaxed ${d ? "text-slate-400" : "text-muted-foreground"}`}>
                Grundbuchauszug über die UVST Schnittstelle abrufen. Verwendet KG-Nr. <span className="font-mono font-medium">{order.katastralgemeinde}</span> und EZ <span className="font-mono font-medium">{order.grundstuecksnummer}</span>.
              </p>

              <div className="flex items-center gap-4">
                <Button onClick={handleUvstAbfrage} disabled={uvstLoading} size="default" className="gap-2">
                  {uvstLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  Grundbuchauszug abrufen
                </Button>
                {order.status === "processed" && (
                  <span className="flex items-center gap-1.5 text-sm text-emerald-500">
                    <CheckCircle2 className="w-4 h-4" /> Bereits verarbeitet
                  </span>
                )}
              </div>

              {uvstError && (
                <div className={`flex items-start gap-3 p-4 rounded-lg ${d ? "bg-red-500/10 border border-red-500/20" : "bg-red-50 border border-red-200"}`}>
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-500">UVST Fehler</p>
                    <p className={`text-sm mt-0.5 ${d ? "text-red-400/70" : "text-red-600"}`}>{uvstError}</p>
                  </div>
                </div>
              )}

              {uvstResult && (
                <div className={`flex items-center justify-between p-4 rounded-lg ${d ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-emerald-50 border border-emerald-200"}`}>
                  <div className="flex items-center gap-2.5 text-emerald-500">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Grundbuchauszug erfolgreich abgerufen</span>
                  </div>
                  {uvstResult.pdfBase64 && (
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => {
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
            </div>
          </div>

          {/* ─── Row 4: Notizen + Dokumente ─── */}
          <div className="grid grid-cols-2 gap-6">
            <div className={sectionCard}>
              <div className="px-7 pt-6 pb-2">
                <h3 className={sectionTitle}><Save className={sectionIcon} /> Verarbeitungsnotizen</h3>
              </div>
              <div className="px-7 pb-7 pt-3 space-y-3">
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notizen zur Bearbeitung..." rows={5}
                  className={`resize-none ${d ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-muted/30 border-border"}`} />
                <Button onClick={handleSaveNotes} disabled={saving || notes === (order.processing_notes || "")} size="sm" className="gap-1.5">
                  <Save className="w-3.5 h-3.5" />Speichern
                </Button>
              </div>
            </div>

            <div className={sectionCard}>
              <div className="px-7 pt-6 pb-2 flex items-center justify-between">
                <h3 className={sectionTitle}><Upload className={sectionIcon} /> Dokumente</h3>
                <span className={`text-xs font-medium ${d ? "text-slate-500" : "text-muted-foreground"}`}>{documents.length} Datei{documents.length !== 1 ? "en" : ""}</span>
              </div>
              <div className="px-7 pb-7 pt-3 space-y-3">
                {/* Visibility toggle */}
                <div className={`flex items-center justify-between p-4 rounded-lg ${d ? "bg-slate-800/60" : "bg-muted/40"}`}>
                  <div>
                    <p className={`text-sm font-medium ${d ? "text-slate-200" : "text-foreground"}`}>Sichtbar für Kunden</p>
                    <p className={`text-[12px] mt-0.5 ${d ? "text-slate-500" : "text-muted-foreground"}`}>
                      {order.digital_storage_subscription ? "Kunde hat Digitale Speicherung gebucht" : "Keine Digitale Speicherung gebucht"}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={order.document_visible ? "default" : "outline"}
                    onClick={async () => { await onUpdateOrder(order.id, { document_visible: !order.document_visible }); }}
                    disabled={!order.digital_storage_subscription}
                    className="gap-1.5"
                  >
                    {order.document_visible ? <><CheckCircle2 className="w-3.5 h-3.5" /> Sichtbar</> : <><Lock className="w-3.5 h-3.5" /> Verborgen</>}
                  </Button>
                </div>

                {/* Upload zone */}
                <label className={`flex flex-col items-center justify-center py-5 px-4 rounded-lg border-2 border-dashed cursor-pointer transition-all ${
                  uploading
                    ? (d ? "border-emerald-500/30 bg-emerald-500/5" : "border-emerald-300 bg-emerald-50")
                    : (d ? "border-slate-700 hover:border-slate-600 bg-slate-800/20" : "border-border hover:border-primary/30 bg-muted/20 hover:bg-muted/40")
                }`}>
                  <input type="file" className="hidden" onChange={handleUploadDocument} accept=".pdf,.xml,.html,.doc,.docx,.jpg,.png" disabled={uploading} />
                  {uploading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin text-emerald-500 mb-1.5" />
                      <span className="text-xs font-medium text-emerald-500">Wird hochgeladen...</span>
                    </>
                  ) : (
                    <>
                      <Upload className={`w-6 h-6 mb-1.5 ${d ? "text-slate-500" : "text-muted-foreground/50"}`} />
                      <span className={`text-xs font-medium ${d ? "text-slate-400" : "text-muted-foreground"}`}>PDF oder Datei hochladen</span>
                      <span className={`text-[11px] mt-0.5 ${d ? "text-slate-600" : "text-muted-foreground/50"}`}>Klicken oder Datei hierher ziehen</span>
                    </>
                  )}
                </label>

                {/* Document list */}
                {documents.length === 0 ? (
                  <div className={`text-center py-6 text-sm ${d ? "text-slate-600" : "text-muted-foreground/50"}`}>Noch keine Dokumente</div>
                ) : (
                  <div className="space-y-1.5">
                    {documents.map((doc: any, i: number) => (
                      <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${d ? "bg-slate-800/40 hover:bg-slate-800/60" : "bg-muted/30 hover:bg-muted/50"}`}>
                        <FileText className={`w-4 h-4 shrink-0 ${d ? "text-slate-400" : "text-muted-foreground"}`} />
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm truncate font-medium ${d ? "text-slate-200" : "text-foreground"}`}>{doc.name}</div>
                        </div>
                        {doc.url && (
                          <a href={doc.url} target="_blank" rel="noopener noreferrer"
                            className={`p-1.5 rounded-md transition-colors ${d ? "text-slate-500 hover:text-slate-300 hover:bg-slate-700" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button onClick={() => handleRemoveDocument(i)}
                          className="p-1.5 rounded-md text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ─── Footer metadata ─── */}
          <div className={`flex items-center gap-6 text-xs pt-2 ${d ? "text-slate-600" : "text-muted-foreground/50"}`}>
            <span>Erstellt: {fmtDate(order.created_at)}</span>
            <span>Aktualisiert: {fmtDate(order.updated_at)}</span>
            {order.moneybird_invoice_id && <span>Moneybird: {order.moneybird_invoice_id}</span>}
            <span className="font-mono text-[11px]">{order.id}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
