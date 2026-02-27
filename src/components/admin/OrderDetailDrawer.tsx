import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  User, Mail, MapPin, FileText, Euro, Clock, Building, Zap, HardDrive, Copy, Check,
} from "lucide-react";
import { useState } from "react";
import type { Tables } from "@/integrations/supabase/types";

type Order = Tables<"orders">;

interface OrderDetailDrawerProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateOrder: (orderId: string, updates: Record<string, unknown>) => Promise<void>;
  onRefresh: () => Promise<void>;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Ausstehend" },
  { value: "processing", label: "In Bearbeitung" },
  { value: "completed", label: "Abgeschlossen" },
  { value: "cancelled", label: "Storniert" },
];

export function OrderDetailDrawer({ order, open, onOpenChange, onUpdateOrder, onRefresh }: OrderDetailDrawerProps) {
  const [copied, setCopied] = useState<string | null>(null);

  if (!order) return null;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("de-AT", {
      day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
    });

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("de-AT", { style: "currency", currency: "EUR" }).format(n);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const InfoRow = ({ icon: Icon, label, value, copyable }: {
    icon: any; label: string; value: string | null | undefined; copyable?: boolean;
  }) => (
    <div className="flex items-start gap-3 py-2">
      <Icon className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-[11px] text-slate-500 uppercase tracking-wider">{label}</div>
        <div className="text-sm text-slate-200 break-all">{value || "—"}</div>
      </div>
      {copyable && value && (
        <button
          onClick={() => copyToClipboard(value, label)}
          className="text-slate-600 hover:text-slate-400 transition-colors mt-1"
        >
          {copied === label ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      )}
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-slate-900 border-slate-800 text-slate-200 w-[440px] sm:max-w-[440px] overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-slate-100 flex items-center gap-2">
            <span className="font-mono text-base">{order.order_number}</span>
          </SheetTitle>
          <div className="text-xs text-slate-500">{formatDate(order.created_at)}</div>
        </SheetHeader>

        {/* Status Controls */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">Status ändern</div>
              <Select
                value={order.status}
                onValueChange={(v) => onUpdateOrder(order.id, { status: v })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-right pt-4">
              <div className="text-2xl font-semibold text-slate-100">{formatCurrency(order.product_price)}</div>
            </div>
          </div>
        </div>

        <Separator className="bg-slate-800" />

        {/* Customer Info */}
        <div className="py-4 space-y-0.5">
          <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Kunde</h3>
          <InfoRow icon={User} label="Name" value={`${order.vorname} ${order.nachname}`} />
          <InfoRow icon={Mail} label="E-Mail" value={order.email} copyable />
          {order.firma && <InfoRow icon={Building} label="Firma" value={order.firma} />}
          <InfoRow
            icon={MapPin}
            label="Adresse"
            value={[order.adresse, [order.plz, order.ort].filter(Boolean).join(" "), order.wohnsitzland].filter(Boolean).join(", ")}
          />
        </div>

        <Separator className="bg-slate-800" />

        {/* Property Info */}
        <div className="py-4 space-y-0.5">
          <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Grundstück</h3>
          <InfoRow icon={FileText} label="Produkt" value={order.product_name} />
          <InfoRow icon={MapPin} label="Bundesland" value={order.bundesland} />
          <InfoRow icon={Building} label="Grundbuchsgericht" value={order.grundbuchsgericht} />
          <InfoRow icon={MapPin} label="Katastralgemeinde" value={order.katastralgemeinde} copyable />
          <InfoRow icon={FileText} label="Grundstücksnummer / EZ" value={order.grundstuecksnummer} copyable />
          {order.wohnungs_hinweis && (
            <InfoRow icon={FileText} label="Wohnungshinweis" value={order.wohnungs_hinweis} />
          )}
        </div>

        <Separator className="bg-slate-800" />

        {/* Extras & Payment */}
        <div className="py-4 space-y-0.5">
          <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Details</h3>
          <InfoRow icon={Euro} label="Zahlungsstatus" value={order.payment_status} />
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
          {order.processing_notes && (
            <InfoRow icon={FileText} label="Verarbeitungsnotizen" value={order.processing_notes} />
          )}
        </div>

        <Separator className="bg-slate-800" />

        {/* Timestamps */}
        <div className="py-4 space-y-0.5">
          <InfoRow icon={Clock} label="Erstellt" value={formatDate(order.created_at)} />
          <InfoRow icon={Clock} label="Aktualisiert" value={formatDate(order.updated_at)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
