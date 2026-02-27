import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import {
  Copy, Check, Save, Upload, Trash2, ExternalLink, ArrowLeft,
  Loader2, CheckCircle2, AlertTriangle, Download, Lock, FileText, Zap, HardDrive, Search,
} from "lucide-react";
import { useAdminTheme } from "@/pages/Admin";
import { useToast } from "@/hooks/use-toast";
import {
  validateEinlage, searchAddress, fetchAktuell, fetchHistorisch, parseAddressResults,
} from "@/services/uvstService";

interface Props {
  order: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateOrder: (orderId: string, updates: Record<string, unknown>) => Promise<void>;
  onRefresh: () => void;
}

const STATUS_OPTIONS = [
  { value: "open", label: "Offen", description: "Neue Bestellung" },
  { value: "awaiting_customer", label: "Warte auf Kunde", description: "Rückfrage gesendet" },
  { value: "processed", label: "Verarbeitet", description: "Auszug versendet" },
  { value: "cancelled", label: "Storniert", description: "Storniert" },
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
  const [uploading, setUploading] = useState(false);

  // Grundbuch state
  const [gbStep, setGbStep] = useState<"idle" | "validating" | "found" | "searching" | "select" | "purchasing" | "done">("idle");
  const [gbError, setGbError] = useState<string | null>(null);
  const [validationFailed, setValidationFailed] = useState(false);
  const [addressResults, setAddressResults] = useState<any[]>([]);
  const [selectedKgEz, setSelectedKgEz] = useState<{ kg: string; ez: string } | null>(null);
  const [purchasedPdf, setPurchasedPdf] = useState<{ type: string; base64: string; kosten: number } | null>(null);
  const [purchaseType, setPurchaseType] = useState<"aktuell" | "historisch" | null>(null);

  useEffect(() => {
    if (order) {
      setNotes(order.processing_notes || "");
      try { setDocuments(Array.isArray(order.documents) ? order.documents : []); } catch { setDocuments([]); }
      setGbStep("idle");
      setGbError(null);
      setValidationFailed(false);
      setAddressResults([]);
      setSelectedKgEz(null);
      setPurchasedPdf(null);
      setPurchaseType(null);
    }
  }, [order]);

  if (!order) return null;

  const fmtDate = (s: string) => new Date(s).toLocaleDateString("de-AT", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const fmtCur = (n: number) => new Intl.NumberFormat("de-AT", { style: "currency", currency: "EUR" }).format(n);
  const hasKgEz = !!(order.katastralgemeinde?.trim() && order.grundstuecksnummer?.trim());
  const sc = STATUS_COLORS[order.status] || STATUS_COLORS.open;

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const handleStatusChange = async (v: string) => { setSaving(true); await onUpdateOrder(order.id, { status: v }); setSaving(false); };
  const handlePaymentChange = async (v: string) => { setSaving(true); await onUpdateOrder(order.id, { payment_status: v }); setSaving(false); };
  const handleSaveNotes = async () => { setSaving(true); await onUpdateOrder(order.id, { processing_notes: notes }); setSaving(false); toast({ title: "Notizen gespeichert" }); };

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
        { method: "POST", headers: { "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, "Authorization": `Bearer ${session?.access_token}` }, body: formData }
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDocuments([...documents, data.document]);
      toast({ title: "Dokument hochgeladen", description: file.name });
      onRefresh();
    } catch (err: any) {
      toast({ title: "Upload fehlgeschlagen", description: err.message, variant: "destructive" });
    } finally { setUploading(false); e.target.value = ""; }
  };

  // ── Grundbuch handlers ──
  const handleValidate = async () => {
    setGbStep("validating"); setGbError(null);
    try {
      await validateEinlage(order.katastralgemeinde, order.grundstuecksnummer);
      setSelectedKgEz({ kg: order.katastralgemeinde, ez: order.grundstuecksnummer });
      setGbStep("found");
    } catch {
      setValidationFailed(true);
      setGbStep("idle");
    }
  };

  const handleSearch = async () => {
    setGbStep("searching"); setGbError(null);
    try {
      const result = await searchAddress({ bundesland: order.bundesland || undefined, ort: order.ort || undefined, strasse: order.adresse || "" });
      const parsed = parseAddressResults(result.data.responseDecoded);
      setAddressResults(parsed);
      setGbStep("select");
    } catch (err: any) {
      setGbError(err.message || "Suche fehlgeschlagen");
      setGbStep("idle");
    }
  };

  const handlePurchase = async (type: "aktuell" | "historisch") => {
    if (!selectedKgEz) return;
    setGbStep("purchasing"); setGbError(null); setPurchaseType(type);
    try {
      const result = type === "aktuell"
        ? await fetchAktuell(selectedKgEz.kg, selectedKgEz.ez)
        : await fetchHistorisch(selectedKgEz.kg, selectedKgEz.ez);
      const kosten = result.data.ergebnis?.kosten?.gesamtKostenInklUst || 0;
      let pdfBase64 = "";
      if (type === "historisch") {
        const match = result.data.responseDecoded?.match(/<(?:ns2:)?PDFOutStream>([\s\S]*?)<\/(?:ns2:)?PDFOutStream>/);
        pdfBase64 = match?.[1]?.trim() || "";
      } else {
        pdfBase64 = result.data.response || "";
      }
      setPurchasedPdf({ type, base64: pdfBase64, kosten });
      setGbStep("done");
    } catch (err: any) {
      setGbError(err.message || "Abruf fehlgeschlagen");
      setGbStep("found");
    }
  };

  const handleDownloadPdf = () => {
    if (!purchasedPdf || !selectedKgEz) return;
    const bytes = Uint8Array.from(atob(purchasedPdf.base64), c => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grundbuch_${selectedKgEz.kg}_${selectedKgEz.ez}_${purchasedPdf.type}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Helpers ──
  const InfoRow = ({ label, value, copyable, mono }: { label: string; value?: string | null; copyable?: boolean; mono?: boolean }) => (
    <div className={`flex items-start justify-between py-2.5 border-b last:border-b-0 ${d ? "border-slate-800/40" : "border-border/20"}`}>
      <span className={`text-[13px] font-medium tracking-wide shrink-0 pt-0.5 ${d ? "text-slate-400" : "text-muted-foreground"}`}>{label}</span>
      <div className="flex items-center gap-1.5 text-right pl-4">
        <span className={`text-[14px] ${mono ? "font-mono" : ""} ${d ? "text-slate-100" : "text-foreground"}`}>{value || "—"}</span>
        {copyable && value && (
          <button onClick={() => copyText(value, label)} className="opacity-40 hover:opacity-80 transition-opacity">
            {copied === label ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
          </button>
        )}
      </div>
    </div>
  );

  const SectionTitle = ({ children }: { children: string }) => (
    <p className={`text-[11px] font-semibold uppercase tracking-widest mb-3 ${d ? "text-slate-500" : "text-muted-foreground/50"}`}>{children}</p>
  );

  const sep = <Separator className={d ? "bg-slate-800/60" : "bg-border/40"} />;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-xl ${d ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-white border-border text-foreground"}`}>

        {/* ─── A. Header ─── */}
        <div className={`sticky top-0 z-10 px-6 py-4 border-b ${d ? "bg-slate-950/95 border-slate-800 backdrop-blur" : "bg-white/95 border-border/50 backdrop-blur"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => onOpenChange(false)}
                className={`h-8 w-8 rounded-full flex items-center justify-center border transition-colors ${d ? "border-slate-700 hover:bg-slate-800 text-slate-400" : "border-border hover:bg-accent text-muted-foreground"}`}>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-lg font-bold tracking-tight ${d ? "text-slate-50" : "text-foreground"}`}>{order.order_number}</span>
                  <Badge variant="outline" className={`text-[10px] font-medium ${d ? sc.dark : sc.light}`}>
                    {STATUS_OPTIONS.find(s => s.value === order.status)?.label || order.status}
                  </Badge>
                </div>
                <span className={`text-[12px] ${d ? "text-slate-500" : "text-muted-foreground"}`}>{fmtDate(order.created_at)}</span>
              </div>
            </div>
            <span className={`text-xl font-bold tracking-tight ${d ? "text-slate-50" : "text-foreground"}`}>{fmtCur(order.product_price)}</span>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* ─── B. Status ─── */}
          <div className="space-y-3">
            <div>
              <label className={`text-[11px] uppercase tracking-wider font-medium ${d ? "text-slate-500" : "text-muted-foreground/60"}`}>Status</label>
              <Select value={order.status} onValueChange={handleStatusChange} disabled={saving}>
                <SelectTrigger className={`w-full mt-1 ${d ? "bg-slate-900 border-slate-700 text-slate-200" : ""}`}><SelectValue /></SelectTrigger>
                <SelectContent className={d ? "bg-slate-900 border-slate-700" : ""}>
                  {STATUS_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className={`text-[11px] uppercase tracking-wider font-medium ${d ? "text-slate-500" : "text-muted-foreground/60"}`}>Zahlung</label>
              <Select value={order.payment_status} onValueChange={handlePaymentChange} disabled={saving}>
                <SelectTrigger className={`w-full mt-1 ${d ? "bg-slate-900 border-slate-700 text-slate-200" : ""}`}><SelectValue /></SelectTrigger>
                <SelectContent className={d ? "bg-slate-900 border-slate-700" : ""}>
                  {PAYMENT_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {sep}

          {/* ─── D. Kunde ─── */}
          <div>
            <SectionTitle>Kunde</SectionTitle>
            <InfoRow label="Name" value={`${order.vorname} ${order.nachname}`} />
            <InfoRow label="E-Mail" value={order.email} copyable />
            {order.firma && <InfoRow label="Firma" value={order.firma} />}
            <InfoRow label="Adresse" value={[order.adresse, [order.plz, order.ort].filter(Boolean).join(" "), order.wohnsitzland].filter(Boolean).join(", ")} />
          </div>

          {sep}

          {/* ─── F. Grundstück ─── */}
          <div>
            <SectionTitle>Grundstück</SectionTitle>
            <InfoRow label="Produkt" value={order.product_name} />
            <InfoRow label="Bundesland" value={order.bundesland} />
            <InfoRow label="Grundbuchsgericht" value={order.grundbuchsgericht} />
            <InfoRow label="Katastralgemeinde" value={order.katastralgemeinde} copyable mono />
            <InfoRow label="Grundstücksnr. / EZ" value={order.grundstuecksnummer} copyable mono />
            {order.wohnungs_hinweis && <InfoRow label="Wohnungshinweis" value={order.wohnungs_hinweis} />}
          </div>

          {sep}

          {/* ─── H. Extras ─── */}
          <div>
            <SectionTitle>Extras</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {order.fast_delivery && (
                <Badge className="gap-1.5 py-1.5 px-3 text-xs font-medium bg-amber-500/15 text-amber-600 border-amber-500/30 hover:bg-amber-500/20">
                  <Zap className="w-3.5 h-3.5" /> Express-Lieferung
                </Badge>
              )}
              {order.digital_storage_subscription && (
                <Badge className="gap-1.5 py-1.5 px-3 text-xs font-medium bg-blue-500/15 text-blue-500 border-blue-500/30 hover:bg-blue-500/20">
                  <HardDrive className="w-3.5 h-3.5" /> Digitale Speicherung
                </Badge>
              )}
              {!order.fast_delivery && !order.digital_storage_subscription && (
                <span className={`text-sm ${d ? "text-slate-500" : "text-muted-foreground"}`}>Keine Extras</span>
              )}
            </div>
            {order.moneybird_invoice_id && (
              <div className="mt-3">
                <InfoRow label="Moneybird" value={order.moneybird_invoice_id} mono />
              </div>
            )}
          </div>

          {sep}

          {/* ─── J. Notizen ─── */}
          <div>
            <SectionTitle>Notizen</SectionTitle>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notizen zur Bearbeitung..." rows={5}
              className={`resize-none ${d ? "bg-slate-900 border-slate-700 text-slate-200" : ""}`} />
            <Button onClick={handleSaveNotes} disabled={saving || notes === (order.processing_notes || "")} size="sm" className="mt-2 gap-1.5 w-full">
              <Save className="w-3.5 h-3.5" /> Speichern
            </Button>
          </div>

          {sep}

          {/* ─── L. Dokumente ─── */}
          <div>
            <SectionTitle>Dokumente</SectionTitle>

            {/* Visibility toggle */}
            <div className={`flex items-center justify-between p-3 rounded-lg mb-3 ${d ? "bg-slate-900/60" : "bg-muted/40"}`}>
              <div>
                <p className={`text-xs font-medium ${d ? "text-slate-300" : "text-foreground"}`}>Sichtbar für Kunden</p>
                <p className={`text-[11px] ${d ? "text-slate-600" : "text-muted-foreground/60"}`}>
                  {order.digital_storage_subscription ? "Digitale Speicherung gebucht" : "Keine Speicherung"}
                </p>
              </div>
              <Button size="sm" variant={order.document_visible ? "default" : "outline"}
                onClick={async () => { await onUpdateOrder(order.id, { document_visible: !order.document_visible }); }}
                disabled={!order.digital_storage_subscription} className="gap-1 text-xs h-7">
                {order.document_visible ? <><CheckCircle2 className="w-3 h-3" /> Sichtbar</> : <><Lock className="w-3 h-3" /> Verborgen</>}
              </Button>
            </div>

            {/* Upload */}
            <label className={`flex items-center justify-center py-4 rounded-lg border-2 border-dashed cursor-pointer transition-all mb-3 ${
              uploading
                ? (d ? "border-emerald-500/30 bg-emerald-500/5" : "border-emerald-300 bg-emerald-50")
                : (d ? "border-slate-700 hover:border-slate-600 bg-slate-900/30" : "border-border hover:border-primary/30 bg-muted/20")
            }`}>
              <input type="file" className="hidden" onChange={handleUploadDocument} accept=".pdf,.xml,.html,.doc,.docx,.jpg,.png" disabled={uploading} />
              {uploading ? (
                <span className="flex items-center gap-2 text-xs text-emerald-500"><Loader2 className="w-4 h-4 animate-spin" /> Wird hochgeladen...</span>
              ) : (
                <span className={`flex items-center gap-2 text-xs ${d ? "text-slate-400" : "text-muted-foreground"}`}><Upload className="w-4 h-4" /> Datei hochladen</span>
              )}
            </label>

            {/* List */}
            {documents.length === 0 ? (
              <p className={`text-center py-4 text-xs ${d ? "text-slate-600" : "text-muted-foreground/50"}`}>Noch keine Dokumente</p>
            ) : (
              <div className="space-y-1">
                {documents.map((doc: any, i: number) => (
                  <div key={i} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg ${d ? "bg-slate-900/40 hover:bg-slate-800/60" : "bg-muted/30 hover:bg-muted/50"}`}>
                    <FileText className={`w-3.5 h-3.5 shrink-0 ${d ? "text-slate-400" : "text-muted-foreground"}`} />
                    <span className={`text-sm truncate flex-1 ${d ? "text-slate-200" : "text-foreground"}`}>{doc.name}</span>
                    {doc.url && (
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className={`p-1 rounded ${d ? "text-slate-500 hover:text-slate-300" : "text-muted-foreground hover:text-foreground"}`}>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <button onClick={() => handleRemoveDocument(i)} className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-red-500/10">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {sep}

          {/* ─── N. Grundbuch Abfrage ─── */}
          <div>
            <SectionTitle>Grundbuch Abfrage</SectionTitle>

            {/* Error */}
            {gbError && (
              <div className={`flex items-start gap-2 p-3 rounded-lg mb-3 text-sm ${d ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-600"}`}>
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{gbError}</span>
              </div>
            )}

            {/* Step: idle */}
            {gbStep === "idle" && (
              <>
                {hasKgEz && !validationFailed ? (
                  <div className="space-y-2">
                    <p className={`text-sm ${d ? "text-slate-300" : "text-foreground"}`}>Katastralgemeinde und Einlagezahl vorhanden.</p>
                    <Button onClick={handleValidate} variant="outline" className="w-full gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Einlage prüfen
                    </Button>
                    <p className={`text-[11px] ${d ? "text-slate-600" : "text-muted-foreground/50"}`}>
                      Prüft KG <span className="font-mono">{order.katastralgemeinde}</span> / EZ <span className="font-mono">{order.grundstuecksnummer}</span> — Kosten: €0,41
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {validationFailed ? (
                      <p className={`text-sm ${d ? "text-red-400" : "text-red-600"}`}>Einlage KG/EZ nicht gefunden.</p>
                    ) : (
                      <p className={`text-sm ${d ? "text-amber-400" : "text-amber-600"}`}>Keine KG/EZ vorhanden.</p>
                    )}
                    <Button onClick={handleSearch} variant="outline" className="w-full gap-2">
                      <Search className="w-4 h-4" /> Adresse suchen
                    </Button>
                    <p className={`text-[11px] ${d ? "text-slate-600" : "text-muted-foreground/50"}`}>
                      Sucht über {order.adresse}, {order.plz} {order.ort}
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Step: validating */}
            {gbStep === "validating" && (
              <Button disabled variant="outline" className="w-full gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Wird geprüft...
              </Button>
            )}

            {/* Step: searching */}
            {gbStep === "searching" && (
              <Button disabled variant="outline" className="w-full gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Adresse wird gesucht...
              </Button>
            )}

            {/* Step: select */}
            {gbStep === "select" && (
              <>
                {addressResults.length > 0 ? (
                  <div className="space-y-2">
                    <p className={`text-sm ${d ? "text-slate-300" : "text-foreground"}`}>{addressResults.length} Treffer gefunden:</p>
                    <div className="space-y-1">
                      {addressResults.map((r, i) => (
                        <button key={i} onClick={() => { setSelectedKgEz({ kg: r.kgNummer, ez: r.einlagezahl }); setGbStep("found"); }}
                          className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-center justify-between ${
                            d ? "bg-slate-900/40 hover:bg-slate-800/70 text-slate-200" : "bg-muted/30 hover:bg-muted/60 text-foreground"
                          }`}>
                          <span className="text-sm font-mono">KG {r.kgNummer} — EZ {r.einlagezahl}</span>
                          <span className={`text-xs ${d ? "text-slate-500" : "text-muted-foreground"}`}>{r.strasse} {r.hausnummer}, {r.ort}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className={`text-sm ${d ? "text-red-400" : "text-red-600"}`}>Keine Treffer gefunden.</p>
                    <Button variant="outline" size="sm" onClick={() => setGbStep("idle")}>Erneut</Button>
                  </div>
                )}
              </>
            )}

            {/* Step: found — show purchase buttons */}
            {gbStep === "found" && selectedKgEz && (
              <div className="space-y-3">
                <div className={`flex items-center gap-2 text-sm ${d ? "text-emerald-400" : "text-emerald-600"}`}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Einlage gefunden — KG <span className="font-mono">{selectedKgEz.kg}</span> / EZ <span className="font-mono">{selectedKgEz.ez}</span></span>
                </div>

                {/* Aktuell */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full text-left flex flex-col items-start h-auto py-3">
                      <span className="text-sm font-medium">Aktueller Grundbuchauszug — ~€5,04</span>
                      <span className={`text-[11px] ${d ? "text-slate-500" : "text-muted-foreground"}`}>Alle Blätter (A, B, C) als PDF</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className={d ? "bg-slate-900 border-slate-700 text-slate-200" : ""}>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Kostenpflichtig abrufen?</AlertDialogTitle>
                      <AlertDialogDescription>Aktueller Grundbuchauszug wird abgerufen. Kosten: ~€5,04</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className={d ? "bg-slate-800 border-slate-700 text-slate-300" : ""}>Abbrechen</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handlePurchase("aktuell")}>Abrufen</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Historisch */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full text-left flex flex-col items-start h-auto py-3">
                      <span className="text-sm font-medium">Historischer Grundbuchauszug — ~€2,72</span>
                      <span className={`text-[11px] ${d ? "text-slate-500" : "text-muted-foreground"}`}>Vollständige Historie als PDF</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className={d ? "bg-slate-900 border-slate-700 text-slate-200" : ""}>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Kostenpflichtig abrufen?</AlertDialogTitle>
                      <AlertDialogDescription>Historischer Grundbuchauszug wird abgerufen. Kosten: ~€2,72</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className={d ? "bg-slate-800 border-slate-700 text-slate-300" : ""}>Abbrechen</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handlePurchase("historisch")}>Abrufen</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}

            {/* Step: purchasing */}
            {gbStep === "purchasing" && (
              <Button disabled variant="outline" className="w-full gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Wird abgerufen...
              </Button>
            )}

            {/* Step: done */}
            {gbStep === "done" && purchasedPdf && (
              <div className="space-y-3">
                <div className={`flex items-center gap-2 text-sm ${d ? "text-emerald-400" : "text-emerald-600"}`}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Grundbuchauszug abgerufen</span>
                </div>
                <p className={`text-xs ${d ? "text-slate-500" : "text-muted-foreground"}`}>Kosten: €{purchasedPdf.kosten}</p>
                <Button onClick={handleDownloadPdf} className="w-full gap-2">
                  <Download className="w-4 h-4" /> PDF herunterladen
                </Button>
                <Button variant="ghost" size="sm" className="w-full" onClick={() => { setPurchasedPdf(null); setGbStep("found"); }}>
                  Neuen Auszug anfordern
                </Button>
              </div>
            )}
          </div>

          {/* ─── Footer ─── */}
          <div className={`text-[11px] pt-2 space-y-0.5 ${d ? "text-slate-600" : "text-muted-foreground/40"}`}>
            <p>Erstellt: {fmtDate(order.created_at)}</p>
            <p>Aktualisiert: {fmtDate(order.updated_at)}</p>
            <p className="font-mono">{order.id}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
