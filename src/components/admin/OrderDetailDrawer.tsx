import { useState, useEffect } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User, Mail, MapPin, FileText, Euro, Clock, Building, Zap, HardDrive,
  Copy, Check, Save, X, Pencil, Upload, Trash2, ExternalLink, StickyNote,
} from "lucide-react";
import { useAdminTheme } from "@/pages/Admin";

interface Order {
  id: string;
  order_number: string;
  vorname: string;
  nachname: string;
  email: string;
  firma: string | null;
  adresse: string | null;
  plz: string | null;
  ort: string | null;
  wohnsitzland: string;
  bundesland: string;
  grundbuchsgericht: string;
  katastralgemeinde: string;
  grundstuecksnummer: string;
  wohnungs_hinweis: string | null;
  product_name: string;
  product_price: number;
  status: string;
  payment_status: string;
  processing_status: string | null;
  processing_notes: string | null;
  fast_delivery: boolean;
  digital_storage_subscription: boolean;
  documents: any;
  moneybird_invoice_id: string | null;
  moneybird_invoice_status: string | null;
  created_at: string;
  updated_at: string;
}

interface Props {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateOrder: (orderId: string, updates: Record<string, unknown>) => Promise<void>;
  onRefresh: () => void;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Ausstehend" },
  { value: "open", label: "Offen" },
  { value: "processing", label: "In Bearbeitung" },
  { value: "awaiting_customer", label: "Warte auf Kunde" },
  { value: "processed", label: "Verarbeitet" },
  { value: "completed", label: "Abgeschlossen" },
  { value: "cancelled", label: "Storniert" },
  { value: "deleted", label: "Gelöscht" },
];

const PAYMENT_OPTIONS = [
  { value: "pending", label: "Ausstehend" },
  { value: "paid", label: "Bezahlt" },
  { value: "failed", label: "Fehlgeschlagen" },
  { value: "refunded", label: "Erstattet" },
];

export function OrderDetailDrawer({ order, open, onOpenChange, onUpdateOrder, onRefresh }: Props) {
  const { isDark: d } = useAdminTheme();
  const [copied, setCopied] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState("");
  const [activeTab, setActiveTab] = useState("details");

  // Docs stored as JSON array in order.documents
  const [documents, setDocuments] = useState<Array<{ name: string; url: string; type: string; added_at: string }>>([]);

  useEffect(() => {
    if (order) {
      setNotes(order.processing_notes || "");
      try {
        setDocuments(Array.isArray(order.documents) ? order.documents : []);
      } catch {
        setDocuments([]);
      }
    }
  }, [order]);

  if (!order) return null;

  const fmtDate = (s: string) =>
    new Date(s).toLocaleDateString("de-AT", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const fmtCur = (n: number) =>
    new Intl.NumberFormat("de-AT", { style: "currency", currency: "EUR" }).format(n);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const handleStatusChange = async (newStatus: string) => {
    setSaving(true);
    await onUpdateOrder(order.id, { status: newStatus });
    setSaving(false);
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
  };

  const handleAddDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // For now, create a local URL reference — in production this would upload to Supabase Storage
    const newDoc = {
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
      added_at: new Date().toISOString(),
    };
    const updated = [...documents, newDoc];
    setDocuments(updated);
    await onUpdateOrder(order.id, { documents: updated });
    e.target.value = "";
  };

  const handleRemoveDocument = async (index: number) => {
    const updated = documents.filter((_, i) => i !== index);
    setDocuments(updated);
    await onUpdateOrder(order.id, { documents: updated });
  };

  // Reusable info row
  const InfoRow = ({ icon: Icon, label, value, copyable }: {
    icon: any; label: string; value: string | null | undefined; copyable?: boolean;
  }) => (
    <div className="flex items-start gap-3 py-2">
      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${d ? "text-slate-500" : "text-gray-400"}`} />
      <div className="flex-1 min-w-0">
        <div className={`text-[11px] uppercase tracking-wider ${d ? "text-slate-500" : "text-gray-400"}`}>{label}</div>
        <div className={`text-sm break-all ${d ? "text-slate-200" : "text-gray-800"}`}>{value || "—"}</div>
      </div>
      {copyable && value && (
        <button onClick={() => copyText(value, label)} className={`mt-1 transition-colors ${d ? "text-slate-600 hover:text-slate-400" : "text-gray-300 hover:text-gray-500"}`}>
          {copied === label ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      )}
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={`w-[520px] sm:max-w-[520px] overflow-y-auto ${d ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-gray-200 text-gray-900"}`}>
        <SheetHeader className="pb-2">
          <SheetTitle className={d ? "text-slate-100" : "text-gray-900"}>
            <span className="font-mono text-base">{order.order_number}</span>
          </SheetTitle>
          <div className={`text-xs ${d ? "text-slate-500" : "text-gray-400"}`}>{fmtDate(order.created_at)}</div>
        </SheetHeader>

        {/* Status + Price row */}
        <div className="flex items-end gap-3 py-4">
          <div className="flex-1 space-y-2">
            <div className={`text-[11px] uppercase tracking-wider ${d ? "text-slate-500" : "text-gray-400"}`}>Status</div>
            <Select value={order.status} onValueChange={handleStatusChange} disabled={saving}>
              <SelectTrigger className={`h-9 ${d ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-gray-50 border-gray-200 text-gray-800"}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={d ? "bg-slate-800 border-slate-700" : ""}>
                {STATUS_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-2">
            <div className={`text-[11px] uppercase tracking-wider ${d ? "text-slate-500" : "text-gray-400"}`}>Zahlung</div>
            <Select value={order.payment_status} onValueChange={handlePaymentChange} disabled={saving}>
              <SelectTrigger className={`h-9 ${d ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-gray-50 border-gray-200 text-gray-800"}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={d ? "bg-slate-800 border-slate-700" : ""}>
                {PAYMENT_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="text-right pb-0.5">
            <div className={`text-2xl font-semibold ${d ? "text-slate-100" : "text-gray-900"}`}>{fmtCur(order.product_price)}</div>
          </div>
        </div>

        <Separator className={d ? "bg-slate-800" : "bg-gray-100"} />

        {/* Tabs: Details | Notizen | Dokumente */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className={`w-full ${d ? "bg-slate-800" : "bg-gray-100"}`}>
            <TabsTrigger value="details" className="flex-1 text-xs">Details</TabsTrigger>
            <TabsTrigger value="notes" className="flex-1 text-xs">Notizen</TabsTrigger>
            <TabsTrigger value="documents" className="flex-1 text-xs">Dokumente</TabsTrigger>
          </TabsList>

          {/* DETAILS TAB */}
          <TabsContent value="details" className="space-y-0 mt-4">
            <h3 className={`text-xs font-medium uppercase tracking-wider mb-2 ${d ? "text-slate-400" : "text-gray-500"}`}>Kunde</h3>
            <InfoRow icon={User} label="Name" value={`${order.vorname} ${order.nachname}`} />
            <InfoRow icon={Mail} label="E-Mail" value={order.email} copyable />
            {order.firma && <InfoRow icon={Building} label="Firma" value={order.firma} />}
            <InfoRow icon={MapPin} label="Adresse"
              value={[order.adresse, [order.plz, order.ort].filter(Boolean).join(" "), order.wohnsitzland].filter(Boolean).join(", ")} />

            <Separator className={`my-3 ${d ? "bg-slate-800" : "bg-gray-100"}`} />

            <h3 className={`text-xs font-medium uppercase tracking-wider mb-2 ${d ? "text-slate-400" : "text-gray-500"}`}>Grundstück</h3>
            <InfoRow icon={FileText} label="Produkt" value={order.product_name} />
            <InfoRow icon={MapPin} label="Bundesland" value={order.bundesland} />
            <InfoRow icon={Building} label="Grundbuchsgericht" value={order.grundbuchsgericht} />
            <InfoRow icon={MapPin} label="Katastralgemeinde" value={order.katastralgemeinde} copyable />
            <InfoRow icon={FileText} label="Grundstücksnr. / EZ" value={order.grundstuecksnummer} copyable />
            {order.wohnungs_hinweis && <InfoRow icon={FileText} label="Wohnungshinweis" value={order.wohnungs_hinweis} />}

            <Separator className={`my-3 ${d ? "bg-slate-800" : "bg-gray-100"}`} />

            <h3 className={`text-xs font-medium uppercase tracking-wider mb-2 ${d ? "text-slate-400" : "text-gray-500"}`}>Extras</h3>
            {order.fast_delivery && (
              <div className="flex items-center gap-2 py-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-amber-400">Express-Lieferung</span>
              </div>
            )}
            {order.digital_storage_subscription && (
              <div className="flex items-center gap-2 py-2">
                <HardDrive className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-blue-400">Digitale Speicherung</span>
              </div>
            )}
            {order.moneybird_invoice_id && (
              <InfoRow icon={FileText} label="Moneybird Rechnungs-ID" value={order.moneybird_invoice_id} copyable />
            )}

            <Separator className={`my-3 ${d ? "bg-slate-800" : "bg-gray-100"}`} />
            <InfoRow icon={Clock} label="Erstellt" value={fmtDate(order.created_at)} />
            <InfoRow icon={Clock} label="Aktualisiert" value={fmtDate(order.updated_at)} />
          </TabsContent>

          {/* NOTES TAB */}
          <TabsContent value="notes" className="mt-4 space-y-3">
            <div className={`text-xs ${d ? "text-slate-400" : "text-gray-500"}`}>
              Verarbeitungsnotizen für diese Bestellung
            </div>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notizen zur Bearbeitung..."
              rows={8}
              className={d ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-gray-50 border-gray-200 text-gray-800"}
            />
            <Button
              onClick={handleSaveNotes}
              disabled={saving || notes === (order.processing_notes || "")}
              size="sm"
              className="gap-1"
            >
              <Save className="w-3.5 h-3.5" />
              Notizen speichern
            </Button>
          </TabsContent>

          {/* DOCUMENTS TAB */}
          <TabsContent value="documents" className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className={`text-xs ${d ? "text-slate-400" : "text-gray-500"}`}>
                {documents.length} Dokument{documents.length !== 1 ? "e" : ""}
              </span>
              <label>
                <input type="file" className="hidden" onChange={handleAddDocument} accept=".pdf,.xml,.html,.doc,.docx,.jpg,.png" />
                <Button variant="outline" size="sm" className="gap-1 cursor-pointer" asChild>
                  <span>
                    <Upload className="w-3.5 h-3.5" />
                    Hochladen
                  </span>
                </Button>
              </label>
            </div>

            {documents.length === 0 ? (
              <div className={`text-center py-8 text-sm ${d ? "text-slate-500" : "text-gray-400"}`}>
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                Noch keine Dokumente
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${d ? "bg-slate-800/50" : "bg-gray-50"}`}>
                    <FileText className={`w-4 h-4 shrink-0 ${d ? "text-slate-400" : "text-gray-400"}`} />
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm truncate ${d ? "text-slate-200" : "text-gray-800"}`}>{doc.name}</div>
                      <div className={`text-[11px] ${d ? "text-slate-500" : "text-gray-400"}`}>
                        {doc.type} • {new Date(doc.added_at).toLocaleDateString("de-AT")}
                      </div>
                    </div>
                    {doc.url && (
                      <a href={doc.url} target="_blank" rel="noopener noreferrer"
                        className={`${d ? "text-slate-400 hover:text-slate-200" : "text-gray-400 hover:text-gray-600"}`}>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button onClick={() => handleRemoveDocument(i)}
                      className="text-red-400 hover:text-red-300 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className={`text-[11px] mt-2 ${d ? "text-slate-600" : "text-gray-300"}`}>
              Tipp: UVST Grundbuch-Dokumente können später automatisch hier verknüpft werden.
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
