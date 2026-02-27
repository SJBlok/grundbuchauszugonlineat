import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { OrderDetailDrawer } from "./OrderDetailDrawer";
import {
  Search, RefreshCw, Package, ChevronLeft, ChevronRight, ExternalLink,
} from "lucide-react";
import { useAdminTheme, useAdminApi } from "@/pages/Admin";

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

const STATUS_CONFIG: Record<string, { label: string; dark: string; light: string }> = {
  pending: { label: "Ausstehend", dark: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30", light: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  processing: { label: "In Bearbeitung", dark: "bg-blue-500/15 text-blue-400 border-blue-500/30", light: "bg-blue-50 text-blue-700 border-blue-200" },
  completed: { label: "Abgeschlossen", dark: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", light: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  cancelled: { label: "Storniert", dark: "bg-red-500/15 text-red-400 border-red-500/30", light: "bg-red-50 text-red-700 border-red-200" },
  failed: { label: "Fehlgeschlagen", dark: "bg-red-500/15 text-red-400 border-red-500/30", light: "bg-red-50 text-red-700 border-red-200" },
  open: { label: "Offen", dark: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30", light: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  awaiting_customer: { label: "Warte auf Kunde", dark: "bg-orange-500/15 text-orange-400 border-orange-500/30", light: "bg-orange-50 text-orange-700 border-orange-200" },
  processed: { label: "Verarbeitet", dark: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", light: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  deleted: { label: "Gelöscht", dark: "bg-slate-500/15 text-slate-400 border-slate-500/30", light: "bg-gray-50 text-gray-500 border-gray-200" },
};

const PAYMENT_CONFIG: Record<string, { label: string; dark: string; light: string }> = {
  pending: { label: "Ausstehend", dark: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30", light: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  paid: { label: "Bezahlt", dark: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", light: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  failed: { label: "Fehlgeschlagen", dark: "bg-red-500/15 text-red-400 border-red-500/30", light: "bg-red-50 text-red-700 border-red-200" },
  refunded: { label: "Erstattet", dark: "bg-slate-500/15 text-slate-400 border-slate-500/30", light: "bg-gray-50 text-gray-500 border-gray-200" },
};

const PAGE_SIZE = 25;

export function OrdersTab() {
  const { isDark: d } = useAdminTheme();
  const { apiKey, supabaseUrl: SUPABASE_URL, supabaseKey: SUPABASE_KEY } = useAdminApi();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", String(PAGE_SIZE));
      params.set("offset", String(page * PAGE_SIZE));
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (paymentFilter !== "all") params.set("payment_status", paymentFilter);

      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/get-orders?${params.toString()}`,
        {
          headers: {
            "Content-Type": "application/json",
            "apikey": SUPABASE_KEY,
            "x-api-key": apiKey,
          },
        }
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to fetch orders");

      let filteredOrders = data.orders || [];

      // Client-side search (edge function doesn't support search)
      if (search.trim()) {
        const q = search.toLowerCase();
        filteredOrders = filteredOrders.filter((o: Order) =>
          o.order_number?.toLowerCase().includes(q) ||
          o.email?.toLowerCase().includes(q) ||
          o.nachname?.toLowerCase().includes(q) ||
          o.vorname?.toLowerCase().includes(q)
        );
      }

      setOrders(filteredOrders);
      setTotalCount(data.total || 0);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, paymentFilter, search]);

  // Auto-load on mount and filter changes
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Realtime subscription for auto-refresh
  useEffect(() => {
    const channel = supabase
      .channel("admin-orders-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        fetchOrders();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchOrders]);

  const stats = useMemo(() => ({
    total: totalCount,
    pageCount: Math.ceil(totalCount / PAGE_SIZE),
  }), [totalCount]);

  const updateOrder = async (orderId: string, updates: Record<string, unknown>) => {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/update-order?id=${orderId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "apikey": SUPABASE_KEY,
            "x-api-key": apiKey,
          },
          body: JSON.stringify(updates),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      // Refresh the selected order
      const data = await res.json();
      if (data.order) setSelectedOrder(data.order);
      fetchOrders();
    } catch (err) {
      console.error("Error updating order:", err);
    }
  };

  const openDetail = (order: Order) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
  };

  const fmt = {
    date: (s: string) => new Date(s).toLocaleDateString("de-AT", { day: "2-digit", month: "2-digit", year: "2-digit" }),
    time: (s: string) => new Date(s).toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" }),
    eur: (n: number) => new Intl.NumberFormat("de-AT", { style: "currency", currency: "EUR" }).format(n),
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-sm">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${d ? "text-slate-500" : "text-gray-400"}`} />
          <Input
            placeholder="Suche: Bestellnr., E-Mail, Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`pl-9 ${d ? "bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500" : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"}`}
          />
        </div>

        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
          <SelectTrigger className={`w-[170px] ${d ? "bg-slate-900 border-slate-700 text-slate-300" : "bg-white border-gray-200 text-gray-700"}`}>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className={d ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200"}>
            <SelectItem value="all">Alle Status</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={paymentFilter} onValueChange={(v) => { setPaymentFilter(v); setPage(0); }}>
          <SelectTrigger className={`w-[170px] ${d ? "bg-slate-900 border-slate-700 text-slate-300" : "bg-white border-gray-200 text-gray-700"}`}>
            <SelectValue placeholder="Zahlung" />
          </SelectTrigger>
          <SelectContent className={d ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200"}>
            <SelectItem value="all">Alle Zahlungen</SelectItem>
            {Object.entries(PAYMENT_CONFIG).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className={`text-xs ml-auto ${d ? "text-slate-500" : "text-gray-400"}`}>
          {loading && <RefreshCw className="w-3 h-3 animate-spin inline mr-1" />}
          {totalCount} Bestellung{totalCount !== 1 ? "en" : ""}
        </span>
      </div>

      {/* Table */}
      <Card className={d ? "bg-slate-900/50 border-slate-800" : "bg-white border-gray-200 shadow-sm"}>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className={`${d ? "border-slate-800" : "border-gray-100"} hover:bg-transparent`}>
                  {["Bestellnr.", "Datum", "Kunde", "Produkt", "KG / EZ", "Betrag", "Status", "Zahlung", ""].map((h, i) => (
                    <TableHead key={i} className={`font-medium ${i === 5 ? "text-right" : ""} ${d ? "text-slate-400" : "text-gray-500"}`}>{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className={`text-center py-12 ${d ? "text-slate-500" : "text-gray-400"}`}>
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                      Laden...
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className={`text-center py-12 ${d ? "text-slate-500" : "text-gray-400"}`}>
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      Keine Bestellungen gefunden
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => {
                    const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                    const pc = PAYMENT_CONFIG[order.payment_status] || PAYMENT_CONFIG.pending;
                    return (
                      <TableRow
                        key={order.id}
                        className={`cursor-pointer transition-colors ${d ? "border-slate-800/50 hover:bg-slate-800/30" : "border-gray-50 hover:bg-gray-50"}`}
                        onClick={() => openDetail(order)}
                      >
                        <TableCell className={`font-mono text-xs ${d ? "text-slate-300" : "text-gray-700"}`}>
                          {order.order_number}
                        </TableCell>
                        <TableCell className={`text-xs ${d ? "text-slate-400" : "text-gray-500"}`}>
                          <div>{fmt.date(order.created_at)}</div>
                          <div className={d ? "text-slate-500" : "text-gray-400"}>{fmt.time(order.created_at)}</div>
                        </TableCell>
                        <TableCell>
                          <div className={`text-sm ${d ? "text-slate-200" : "text-gray-800"}`}>
                            {order.vorname} {order.nachname}
                          </div>
                          <div className={`text-xs ${d ? "text-slate-500" : "text-gray-400"}`}>{order.email}</div>
                        </TableCell>
                        <TableCell className={`text-xs ${d ? "text-slate-400" : "text-gray-500"}`}>
                          {order.product_name}
                          {order.fast_delivery && (
                            <Badge variant="outline" className={`ml-1 text-[10px] px-1 py-0 ${d ? "border-amber-500/30 text-amber-400" : "border-amber-200 text-amber-600"}`}>
                              Express
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className={`text-xs font-mono ${d ? "text-slate-400" : "text-gray-500"}`}>
                          <div>{order.katastralgemeinde}</div>
                          <div className={d ? "text-slate-500" : "text-gray-400"}>EZ {order.grundstuecksnummer}</div>
                        </TableCell>
                        <TableCell className={`text-right text-sm font-medium ${d ? "text-slate-200" : "text-gray-800"}`}>
                          {fmt.eur(order.product_price)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[11px] ${d ? sc.dark : sc.light}`}>{sc.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[11px] ${d ? pc.dark : pc.light}`}>{pc.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <ExternalLink className={`w-3.5 h-3.5 ${d ? "text-slate-600" : "text-gray-300"}`} />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {stats.pageCount > 1 && (
        <div className="flex items-center justify-between">
          <span className={`text-xs ${d ? "text-slate-500" : "text-gray-400"}`}>
            Seite {page + 1} von {stats.pageCount}
          </span>
          <div className="flex gap-1">
            {[{ icon: ChevronLeft, dis: page === 0, fn: () => setPage(page - 1) },
              { icon: ChevronRight, dis: page >= stats.pageCount - 1, fn: () => setPage(page + 1) }]
              .map(({ icon: I, dis, fn }, i) => (
                <Button key={i} variant="outline" size="sm" disabled={dis} onClick={fn}
                  className={`h-8 w-8 p-0 ${d ? "border-slate-700 text-slate-400 hover:bg-slate-800" : "border-gray-200 text-gray-500 hover:bg-gray-100"}`}>
                  <I className="w-4 h-4" />
                </Button>
              ))}
          </div>
        </div>
      )}

      <OrderDetailDrawer
        order={selectedOrder}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onUpdateOrder={updateOrder}
        onRefresh={fetchOrders}
      />
    </div>
  );
}
