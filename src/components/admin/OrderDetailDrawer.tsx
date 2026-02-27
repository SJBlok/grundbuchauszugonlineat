import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import {
  Copy, Check, Save, Upload, Trash2, ExternalLink,
  Loader2, CheckCircle2, AlertTriangle, Download, Lock, FileText,
  Zap, HardDrive, Search, MoreVertical, ShieldCheck,
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
  { value: "pending", label: "Neu / Ausstehend" },
  { value: "open", label: "Offen" },
  { value: "processing", label: "In Bearbeitung" },
  { value: "awaiting_customer", label: "Warte auf Kunde" },
  { value: "processed", label: "Verarbeitet" },
  { value: "completed", label: "Abgeschlossen" },
  { value: "cancelled", label: "Storniert" },
];

const STATUS_COLORS: Record<string, { dark: string; light: string }> = {
  pending: { dark: "bg-amber-500/15 text-amber-400 border-amber-500/30", light: "bg-amber-50 text-amber-700 border-amber-200" },
  open: { dark: "bg-amber-500/15 text-amber-400 border-amber-500/30", light: "bg-amber-50 text-amber-700 border-amber-200" },
  processing: { dark: "bg-blue-500/15 text-blue-400 border-blue-500/30", light: "bg-blue-50 text-blue-700 border-blue-200" },
  awaiting_customer: { dark: "bg-blue-500/15 text-blue-400 border-blue-500/30", light: "bg-blue-50 text-blue-700 border-blue-200" },
  processed: { dark: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", light: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  completed: { dark: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", light: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  cancelled: { dark: "bg-red-500/15 text-red-400 border-red-500/30", light: "bg-red-50 text-red-700 border-red-200" },
  deleted: { dark: "bg-red-500/15 text-red-400 border-red-500/30", light: "bg-red-50 text-red-700 border-red-200" },
};

export function OrderDetailDrawer({ order, open, onOpenChange, onUpdateOrder, onRefresh }: Props) {
  const { isDark: d } = useAdminTheme();
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState("");
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Grundbuch state
  const [gbStep, setGbStep] = useState<"idle" | "validating" | "found" | "searching" | "select" | "purchasing" | "done">("idle");
  const [gbError, setGbError] = useState<string | null>(null);
  const [validationFailed, setValidationFailed] = useState(false);
  const [addressResults, setAddressResults] = useState<any[]>([]);
  const [selectedKgEz, setSelectedKgEz] = useState<{ kg: string; ez: string } | null>(null);
  const [purchasedPdf, setPurchasedPdf] = useState<{ type: string; base64: string; kosten: number } | null>(null);
  const [overrideType, setOverrideType] = useState<"aktuell" | "historisch" | null>(null);
  const [overrideSignatur, setOverrideSignatur] = useState<boolean | null>(null);

  useEffect(() => {
    if (order) {
      setNotes(order.processing_notes || "");
      try { setDocuments(Array.isArray(order.documents) ? order.documents : []); } catch { setDocuments([]); }
      setGbStep("idle"); setGbError(null); setValidationFailed(false);
      setAddressResults([]); setSelectedKgEz(null); setPurchasedPdf(null);
      setOverrideType(null); setOverrideSignatur(null);
    }
  }, [order]);

  if (!order) return null;

  const fmtDate = (s: string) => new Date(s).toLocaleDateString("de-AT", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const fmtCur = (n: number) => new Intl.NumberFormat("de-AT", { style: "currency", currency: "EUR" }).format(n);
  const hasKgEz = !!(order.katastralgemeinde?.trim() && order.grundstuecksnummer?.trim());
  const isHistorisch = order.product_name?.toLowerCase().includes("historisch");
  const wantsSignatur = order.amtliche_signatur === true;
  const productLabel = isHistorisch ? "Historischer Grundbuchauszug" : "Aktueller Grundbuchauszug";
  const estimatedCost = isHistorisch ? "~€2,72" : "~€5,04";
  const sc = STATUS_COLORS[order.status] || STATUS_COLORS.open;
  const statusLabel = STATUS_OPTIONS.find(s => s.value === order.status)?.label || order.status;

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const handleStatusChange = async (v: string) => { setSaving(true); await onUpdateOrder(order.id, { status: v }); setSaving(false); };
  const handleSaveNotes = async () => { setSaving(true); await onUpdateOrder(order.id, { processing_notes: notes }); setSaving(false); toast({ title: "Notizen gespeichert" }); };

  const handleHardDelete = async () => {
    if (!order) return;
    setIsDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ order_id: order.id }),
        }
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast({ title: "Order gelöscht", description: `${order.order_number} wurde endgültig gelöscht.` });
      setShowDeleteConfirm(false);
      onOpenChange(false);
      onRefresh();
    } catch (err: any) {
      toast({ title: "Fehler", description: err.message, variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
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
    } catch { setValidationFailed(true); setGbStep("idle"); }
  };

  const handleSearch = async () => {
    setGbStep("searching"); setGbError(null);
    try {
      const result = await searchAddress({ bundesland: order.bundesland || undefined, ort: order.ort || undefined, plz: order.plz || undefined, strasse: order.adresse || "" });
      setAddressResults(parseAddressResults(result.data.responseDecoded));
      setGbStep("select");
    } catch (err: any) { setGbError(err.message || "Suche fehlgeschlagen"); setGbStep("idle"); }
  };

  const handlePurchase = async (type: "aktuell" | "historisch") => {
    if (!selectedKgEz) return;
    const useSignatur = overrideSignatur ?? wantsSignatur;
    setGbStep("purchasing");
    setGbError(null);

    try {
      // 1. Abruf bij UVST via proxy
      const result = type === "aktuell"
        ? await fetchAktuell(selectedKgEz.kg, selectedKgEz.ez, useSignatur)
        : await fetchHistorisch(selectedKgEz.kg, selectedKgEz.ez, useSignatur);

      const kosten = result.data.ergebnis?.kosten?.gesamtKostenInklUst || 0;

      // 2. Extract PDF
      let pdfBase64 = "";
      if (type === "historisch") {
        const match = result.data.responseDecoded?.match(/<(?:ns2:)?PDFOutStream>([\s\S]*?)<\/(?:ns2:)?PDFOutStream>/);
        pdfBase64 = match?.[1]?.trim() || "";
      } else {
        pdfBase64 = result.data.response || "";
      }
      if (!pdfBase64) throw new Error("Kein PDF in der Antwort gefunden");

      // 3. Maak PDF bestand
      const fileName = `grundbuch_${selectedKgEz.kg}_${selectedKgEz.ez}_${type}${useSignatur ? "_signiert" : ""}.pdf`;
      const bytes = Uint8Array.from(atob(pdfBase64), c => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: "application/pdf" });
      const file = new File([blob], fileName, { type: "application/pdf" });

      // 4. Upload naar Supabase Storage
      const { data: { session } } = await supabase.auth.getSession();
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("order_id", order.id);
      uploadFormData.append("order_number", order.order_number);
      const uploadRes = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-order-document`,
        {
          method: "POST",
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: uploadFormData,
        }
      );
      const uploadData = await uploadRes.json();
      if (uploadData.error) throw new Error(uploadData.error);
      setDocuments(prev => [...prev, uploadData.document]);

      // 5. Lokale download
      const downloadUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = downloadUrl;
      downloadLink.download = fileName;
      downloadLink.click();
      URL.revokeObjectURL(downloadUrl);

      // 6. Status + notities updaten
      const timestamp = new Date().toLocaleString("de-AT");
      const costNote = `[${timestamp}] UVST ${type === "historisch" ? "GT_GBP" : "GT_GBA"} abgerufen — KG ${selectedKgEz.kg} / EZ ${selectedKgEz.ez}${useSignatur ? " (signiert)" : ""} — Kosten: €${kosten.toFixed(2)}`;
      const updatedNotes = notes ? `${notes}\n${costNote}` : costNote;
      setNotes(updatedNotes);
      await onUpdateOrder(order.id, { status: "processed", processing_notes: updatedNotes });

      // 7. Email naar klant met PDF bijlage
      try {
        const emailRes = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-grundbuch-document`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              Authorization: `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({
              order_id: order.id,
              pdf_base64: pdfBase64,
              document_type: type,
            }),
          }
        );
        const emailData = await emailRes.json();
        if (emailData.error) {
          console.error("Email error:", emailData.error);
          toast({ title: "Email-Versand fehlgeschlagen", description: emailData.error, variant: "destructive" });
        } else {
          toast({ title: "Email versendet", description: `Grundbuchauszug an ${order.email} gesendet` });
        }
      } catch (emailErr: any) {
        console.error("Email send error:", emailErr);
        toast({ title: "Email-Versand fehlgeschlagen", description: emailErr.message, variant: "destructive" });
      }

      // 8. Done
      setPurchasedPdf({ type, base64: pdfBase64, kosten });
      setGbStep("done");
      toast({ title: "Grundbuchauszug erfolgreich", description: `${fileName} wurde gespeichert, heruntergeladen und per Email versendet.` });
      onRefresh();
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
  const InfoRow = ({ label, value, copyable, mono }: { label: string; value?: string | null; copyable?: boolean; mono?: boolean }) => {
    if (!value && !copyable) return null;
    return (
      <div className={`flex items-center justify-between py-2 ${d ? "border-slate-800/30" : "border-border/15"}`}>
        <span className={`text-[13px] ${d ? "text-slate-400" : "text-gray-500"}`}>{label}</span>
        <div className="flex items-center gap-1.5 text-right pl-4">
          <span className={`text-[13px] ${mono ? "font-mono" : ""} ${d ? "text-slate-100" : "text-gray-900"}`}>{value || "—"}</span>
          {copyable && value && (
            <button onClick={() => copyText(value, label)} className="opacity-40 hover:opacity-80 transition-opacity">
              {copied === label ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>
    );
  };

  const SectionTitle = ({ children, right }: { children: string; right?: React.ReactNode }) => (
    <div className="flex items-center justify-between mb-3">
      <p className={`text-xs font-medium uppercase tracking-wider ${d ? "text-slate-500" : "text-gray-400"}`}>{children}</p>
      {right}
    </div>
  );

  const sep = <Separator className={`my-1 ${d ? "bg-slate-800/60" : "bg-border/40"}`} />;

  const hasExtras = order.fast_delivery || order.digital_storage_subscription;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-xl ${d ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-white border-border text-foreground"}`}>

        {/* ─── A. Header ─── */}
        <div className={`px-6 pt-5 pb-4 ${d ? "border-slate-800" : "border-border/50"}`}>
          <div className="flex items-center justify-between">
            <div>
              <span className={`font-mono text-base font-semibold ${d ? "text-slate-50" : "text-foreground"}`}>{order.order_number}</span>
              <span className={`block text-[12px] mt-0.5 ${d ? "text-slate-500" : "text-gray-400"}`}>{fmtDate(order.created_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-semibold tracking-tight ${d ? "text-slate-50" : "text-foreground"}`}>{fmtCur(order.product_price)}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className={`h-8 w-8 ${d ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800" : "text-gray-400 hover:text-gray-700"}`}>
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className={d ? "bg-slate-900 border-slate-700" : ""}>
                  {STATUS_OPTIONS.map(s => (
                    <DropdownMenuItem key={s.value} onClick={() => handleStatusChange(s.value)}
                      className={`gap-2 ${d ? "text-slate-200 focus:bg-slate-800" : ""}`}>
                      {order.status === s.value && <Check className="w-3.5 h-3.5" />}
                      {order.status !== s.value && <span className="w-3.5" />}
                      {s.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <Badge variant="outline" className={`mt-2 text-[11px] font-medium ${d ? sc.dark : sc.light}`}>
            {statusLabel}
          </Badge>
        </div>

        {sep}

        {/* ─── C. Bestelldetails ─── */}
        <div className="px-6 py-4 space-y-0.5">
          <InfoRow label="Name" value={`${order.vorname} ${order.nachname}`} />
          <InfoRow label="E-Mail" value={order.email} copyable />
          {order.firma && <InfoRow label="Firma" value={order.firma} />}
          <InfoRow
            label="Straße"
            value={order.adresse ? order.adresse.replace(/\s+\S*$/, "").trim() || order.adresse : ""}
          />
          <InfoRow
            label="Hausnr."
            value={order.adresse ? (order.adresse.match(/\s(\S+)$/) || [])[1] || "" : ""}
          />
          <InfoRow label="PLZ" value={order.plz} />
          <InfoRow label="Ort" value={order.ort} />
          <InfoRow label="Bundesland" value={order.bundesland} />
          <InfoRow label="Produkt" value={order.product_name} />
          <InfoRow label="Grundbuchsgericht" value={order.grundbuchsgericht} />
          <InfoRow label="Katastralgemeinde" value={order.katastralgemeinde} copyable mono />
          <InfoRow label="Grundstücksnr. / EZ" value={order.grundstuecksnummer} copyable mono />
          {order.wohnungs_hinweis && <InfoRow label="Wohnungshinweis" value={order.wohnungs_hinweis} />}
          <InfoRow label="Amtliche Signatur" value={order.amtliche_signatur ? "Ja" : "Nein"} />

          {hasExtras && (
            <div className="flex flex-wrap gap-2 pt-3">
              {order.fast_delivery && (
                <Badge className="gap-1.5 py-1 px-2.5 text-[11px] font-medium bg-amber-500/15 text-amber-600 border-amber-500/30 hover:bg-amber-500/20">
                  <Zap className="w-3 h-3" /> Express
                </Badge>
              )}
              {order.digital_storage_subscription && (
                <Badge className="gap-1.5 py-1 px-2.5 text-[11px] font-medium bg-blue-500/15 text-blue-500 border-blue-500/30 hover:bg-blue-500/20">
                  <HardDrive className="w-3 h-3" /> Digitale Speicherung
                </Badge>
              )}
            </div>
          )}
        </div>

        {sep}

        {/* ─── E. Grundbuch Abfrage ─── */}
        <div className="px-6 py-4">
          <SectionTitle>Grundbuch Abfrage</SectionTitle>

          {gbError && (
            <div className={`flex items-start gap-2 p-3 rounded-lg mb-3 text-sm ${d ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-600"}`}>
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{gbError}</span>
            </div>
          )}

          {gbStep === "idle" && (
            <>
              {hasKgEz && !validationFailed ? (
                <div className="space-y-2">
                  <Button onClick={handleValidate} variant="outline" className="w-full gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Einlage prüfen
                  </Button>
                  <p className={`text-[11px] ${d ? "text-slate-600" : "text-gray-400"}`}>
                    KG <span className="font-mono">{order.katastralgemeinde}</span> / EZ <span className="font-mono">{order.grundstuecksnummer}</span> — €0,41
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {validationFailed
                    ? <p className={`text-sm ${d ? "text-red-400" : "text-red-600"}`}>Einlage nicht gefunden.</p>
                    : <p className={`text-sm ${d ? "text-amber-400" : "text-amber-600"}`}>Keine KG/EZ vorhanden.</p>
                  }
                  <Button onClick={handleSearch} variant="outline" className="w-full gap-2">
                    <Search className="w-4 h-4" /> Adresse suchen
                  </Button>
                  <p className={`text-[11px] ${d ? "text-slate-600" : "text-gray-400"}`}>
                    Sucht über {order.adresse}, {order.plz} {order.ort}
                  </p>
                </div>
              )}
            </>
          )}

          {gbStep === "validating" && (
            <Button disabled variant="outline" className="w-full gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Wird geprüft...
            </Button>
          )}

          {gbStep === "searching" && (
            <Button disabled variant="outline" className="w-full gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Adresse wird gesucht...
            </Button>
          )}

          {gbStep === "select" && (
            <>
              {addressResults.length > 0 ? (
                <div className="space-y-2">
                  <p className={`text-sm ${d ? "text-slate-300" : "text-foreground"}`}>{addressResults.length} Treffer gefunden:</p>
                  <div className="space-y-1">
                    {addressResults.map((r, i) => (
                      <button key={i} onClick={() => { setSelectedKgEz({ kg: r.kgNummer, ez: r.einlagezahl }); setGbStep("found"); }}
                        className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-center justify-between ${
                          d ? "bg-slate-900/40 hover:bg-slate-800/70 text-slate-200" : "bg-gray-50 hover:bg-gray-100 text-foreground"
                        }`}>
                        <span className="text-sm font-mono">KG {r.kgNummer} ({r.kgName}) — EZ {r.einlagezahl}</span>
                        <span className={`text-xs ${d ? "text-slate-500" : "text-gray-400"}`}>{r.strasse} {r.hausnummer}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className={`text-sm ${d ? "text-red-400" : "text-red-600"}`}>Keine Treffer.</p>
                  <Button variant="outline" size="sm" onClick={() => setGbStep("idle")}>Erneut</Button>
                </div>
              )}
            </>
          )}

          {gbStep === "found" && selectedKgEz && (() => {
            const selectedType = overrideType ?? (isHistorisch ? "historisch" : "aktuell");
            const selectedSignatur = overrideSignatur ?? wantsSignatur;
            const label = selectedType === "historisch" ? "Historischer Grundbuchauszug" : "Aktueller Grundbuchauszug";
            const cost = selectedType === "historisch" ? "~€2,72" : "~€5,04";

            return (
              <div className="space-y-3">
                <div className={`flex items-center gap-2 text-sm ${d ? "text-emerald-400" : "text-emerald-600"}`}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Einlage gefunden — KG <span className="font-mono">{selectedKgEz.kg}</span> / EZ <span className="font-mono">{selectedKgEz.ez}</span></span>
                </div>

                {/* Product keuze */}
                <div className={`p-3 rounded-lg space-y-2 ${d ? "bg-slate-900/60" : "bg-gray-50"}`}>
                  <div className="flex gap-2">
                    <Button
                      variant={selectedType === "aktuell" ? "default" : "outline"}
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => setOverrideType("aktuell")}
                    >
                      Aktuell ~€5,04
                    </Button>
                    <Button
                      variant={selectedType === "historisch" ? "default" : "outline"}
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => setOverrideType("historisch")}
                    >
                      Historisch ~€2,72
                    </Button>
                  </div>

                  <label className={`flex items-center gap-2 cursor-pointer py-1 ${d ? "text-slate-300" : "text-gray-700"}`}>
                    <input
                      type="checkbox"
                      checked={selectedSignatur}
                      onChange={(e) => setOverrideSignatur(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-xs">Amtliche Signatur hinzufügen</span>
                  </label>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="default" className="w-full gap-2">
                      <Download className="w-4 h-4" /> {label} abrufen
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className={d ? "bg-slate-900 border-slate-700 text-slate-200" : ""}>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Kostenpflichtig abrufen?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {label} wird abgerufen{selectedSignatur ? " (mit amtlicher Signatur)" : ""}. Kosten: {cost}. Das Dokument wird automatisch zur Bestellung hinzugefügt.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className={d ? "bg-slate-800 border-slate-700 text-slate-300" : ""}>Abbrechen</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handlePurchase(selectedType)}>
                        Abrufen & speichern
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => {
                    setGbStep("idle");
                    setSelectedKgEz(null);
                    setOverrideType(null);
                    setOverrideSignatur(null);
                    setValidationFailed(false);
                    setAddressResults([]);
                    setGbError(null);
                  }}
                >
                  Suche zurücksetzen
                </Button>
              </div>
            );
          })()}

          {gbStep === "purchasing" && (
            <Button disabled variant="outline" className="w-full gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Wird abgerufen...
            </Button>
          )}

          {gbStep === "done" && purchasedPdf && (
            <div className="space-y-3">
              <div className={`flex items-center gap-2 text-sm ${d ? "text-emerald-400" : "text-emerald-600"}`}>
                <CheckCircle2 className="w-4 h-4" />
                <span>Grundbuchauszug abgerufen & gespeichert — €{purchasedPdf.kosten.toFixed(2)}</span>
              </div>
              <div className={`p-3 rounded-lg text-xs space-y-1 ${d ? "bg-emerald-500/10 text-emerald-300" : "bg-emerald-50 text-emerald-700"}`}>
                <p>✓ PDF automatisch als Dokument hinzugefügt</p>
                <p>✓ PDF lokal heruntergeladen</p>
                <p>✓ Email mit PDF an {order.email} gesendet</p>
                <p>✓ Status auf „Verarbeitet" gesetzt</p>
                <p>✓ Kosten in Notizen protokolliert</p>
                {order.digital_storage_subscription && order.document_visible && (
                  <p>✓ Kunde kann das Dokument unter „Meine Dokumente" einsehen</p>
                )}
              </div>
              <Button onClick={handleDownloadPdf} variant="outline" className="w-full gap-2">
                <Download className="w-4 h-4" /> PDF auch lokal herunterladen
              </Button>
              <Button variant="ghost" size="sm" className="w-full" onClick={() => { setPurchasedPdf(null); setGbStep("found"); }}>
                Weiteren Auszug anfordern
              </Button>
            </div>
          )}
        </div>

        {sep}

        {/* ─── G. Dokumente ─── */}
        <div className="px-6 py-4">
          <SectionTitle right={
            <label className="cursor-pointer">
              <input type="file" className="hidden" onChange={handleUploadDocument} accept=".pdf,.xml,.html,.doc,.docx,.jpg,.png" disabled={uploading} />
              <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs pointer-events-none" asChild>
                <span>{uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />} Upload</span>
              </Button>
            </label>
          }>Dokumente</SectionTitle>

          {/* Visibility toggle */}
          <div className={`flex items-center justify-between p-3 rounded-lg mb-3 ${d ? "bg-slate-900/60" : "bg-gray-50"}`}>
            <div>
              <p className={`text-xs font-medium ${d ? "text-slate-300" : "text-foreground"}`}>Sichtbar für Kunden</p>
              <p className={`text-[11px] ${d ? "text-slate-600" : "text-gray-400"}`}>
                {order.digital_storage_subscription ? "Digitale Speicherung gebucht" : "Keine Speicherung"}
              </p>
            </div>
            <Button size="sm" variant={order.document_visible ? "default" : "outline"}
              onClick={async () => { await onUpdateOrder(order.id, { document_visible: !order.document_visible }); }}
              className="gap-1 text-xs h-7">
              {order.document_visible ? <><CheckCircle2 className="w-3 h-3" /> Sichtbar</> : <><Lock className="w-3 h-3" /> Verborgen</>}
            </Button>
          </div>

          {documents.length === 0 ? (
            <div className={`flex items-center justify-center gap-2 py-6 text-xs ${d ? "text-slate-600" : "text-gray-400"}`}>
              <FileText className="w-4 h-4" /> Noch keine Dokumente
            </div>
          ) : (
            <div className="space-y-1">
              {documents.map((doc: any, i: number) => (
                <div key={i} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg ${d ? "bg-slate-900/40 hover:bg-slate-800/60" : "bg-gray-50 hover:bg-gray-100"}`}>
                  <FileText className={`w-3.5 h-3.5 shrink-0 ${d ? "text-slate-400" : "text-gray-400"}`} />
                  <span className={`text-sm truncate flex-1 ${d ? "text-slate-200" : "text-foreground"}`}>{doc.name}</span>
                  {doc.url && (
                    <button onClick={async () => {
                      try {
                        const res = await fetch(doc.url);
                        const blob = await res.blob();
                        const blobUrl = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = blobUrl;
                        a.download = doc.name || "dokument";
                        a.click();
                        URL.revokeObjectURL(blobUrl);
                      } catch { window.open(doc.url, "_blank"); }
                    }} className={`p-1 rounded ${d ? "text-emerald-400 hover:text-emerald-300" : "text-emerald-600 hover:text-emerald-700"}`} title="Herunterladen">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {doc.url && (
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className={`p-1 rounded ${d ? "text-slate-500 hover:text-slate-300" : "text-gray-400 hover:text-foreground"}`} title="In neuem Tab öffnen">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <button onClick={() => handleRemoveDocument(i)} className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-red-500/10" title="Entfernen">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {sep}

        {/* ─── I. Notizen ─── */}
        <div className="px-6 py-4 pb-6">
          <SectionTitle>Notizen</SectionTitle>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notizen zur Bearbeitung..." rows={4}
            className={`resize-none ${d ? "bg-slate-900 border-slate-700 text-slate-200" : ""}`} />
          <Button onClick={handleSaveNotes} disabled={saving || notes === (order.processing_notes || "")} size="sm" className="mt-2 gap-1.5 w-full">
            <Save className="w-3.5 h-3.5" /> Speichern
          </Button>
        </div>

        {sep}

        {/* ─── J. Gefahrenzone ─── */}
        <div className="px-6 py-4 pb-6">
          <SectionTitle>Gefahrenzone</SectionTitle>
          <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(true)}
            className="w-full gap-1.5 border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-400">
            <Trash2 className="w-3.5 h-3.5" />
            Order endgültig löschen
          </Button>
        </div>

      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className={d ? "bg-slate-900 border-slate-700" : ""}>
          <AlertDialogHeader>
            <AlertDialogTitle className={d ? "text-slate-100" : ""}>Order endgültig löschen?</AlertDialogTitle>
            <AlertDialogDescription className={d ? "text-slate-400" : ""}>
              Die Order <span className="font-mono font-semibold">{order?.order_number}</span> und alle zugehörigen Dokumente werden unwiderruflich gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={d ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700" : ""}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleHardDelete} disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white">
              {isDeleting ? <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Wird gelöscht...</> : "Endgültig löschen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
