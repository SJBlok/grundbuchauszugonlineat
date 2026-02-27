import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { Tables } from "@/integrations/supabase/types";

type Order = Tables<"orders">;

interface OrderDetailDrawerProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (orderId: string, newStatus: string) => void;
}

const STATUS_OPTIONS = [
  { value: "open", label: "Offen" },
  { value: "awaiting_customer", label: "Warten auf Kunde" },
  { value: "processed", label: "Verarbeitet" },
  { value: "cancelled", label: "Storniert" },
  { value: "deleted", label: "Gelöscht" },
];

export function OrderDetailDrawer({ order, open, onOpenChange, onStatusChange }: OrderDetailDrawerProps) {
  if (!order) return null;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("de-AT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("de-AT", { style: "currency", currency: "EUR" }).format(n);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-slate-950 border-slate-800 text-slate-100 w-[480px] sm:max-w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-slate-100">
            Bestellung {order.order_number}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Status */}
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wide mb-2 block">Status ändern</label>
            <Select value={order.status} onValueChange={(v) => onStatusChange(order.id, v)}>
              <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Kunde */}
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wide mb-2 block">Kunde</label>
            <div className="bg-slate-900 rounded-lg p-3 space-y-1 text-sm">
              <div className="text-slate-200">{order.vorname} {order.nachname}</div>
              {order.firma && <div className="text-slate-400">{order.firma}</div>}
              <div className="text-slate-400">{order.email}</div>
              {order.adresse && <div className="text-slate-500">{order.adresse}</div>}
              {order.plz && order.ort && <div className="text-slate-500">{order.plz} {order.ort}</div>}
              <div className="text-slate-500">{order.wohnsitzland}</div>
            </div>
          </div>

          {/* Grundstück */}
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wide mb-2 block">Grundstück</label>
            <div className="bg-slate-900 rounded-lg p-3 space-y-1 text-sm">
              <div className="text-slate-200">KG: {order.katastralgemeinde}</div>
              <div className="text-slate-300">EZ: {order.grundstuecksnummer}</div>
              <div className="text-slate-400">Gericht: {order.grundbuchsgericht}</div>
              <div className="text-slate-400">Bundesland: {order.bundesland}</div>
              {order.wohnungs_hinweis && <div className="text-slate-500">Hinweis: {order.wohnungs_hinweis}</div>}
            </div>
          </div>

          {/* Produkt */}
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wide mb-2 block">Produkt</label>
            <div className="bg-slate-900 rounded-lg p-3 space-y-1 text-sm">
              <div className="text-slate-200">{order.product_name}</div>
              <div className="text-slate-300 font-medium">{formatCurrency(order.product_price)}</div>
              {order.fast_delivery && (
                <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-xs">Express Lieferung</Badge>
              )}
              {order.digital_storage_subscription && (
                <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-xs ml-1">Digitale Speicherung</Badge>
              )}
            </div>
          </div>

          {/* Zeitstempel */}
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wide mb-2 block">Zeitstempel</label>
            <div className="bg-slate-900 rounded-lg p-3 space-y-1 text-xs text-slate-500">
              <div>Erstellt: {formatDate(order.created_at)}</div>
              <div>Aktualisiert: {formatDate(order.updated_at)}</div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
