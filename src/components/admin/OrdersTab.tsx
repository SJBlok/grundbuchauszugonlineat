import { useEffect, useState, useMemo } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderDetailDrawer } from "./OrderDetailDrawer";
import {
  Search, RefreshCw, Package, Euro, Clock, CheckCircle2,
  AlertCircle, ChevronLeft, ChevronRight, ExternalLink,
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Order = Tables<"orders">;

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: "Ausstehend", color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  processing: { label: "In Bearbeitung", color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  completed: { label: "Abgeschlossen", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  cancelled: { label: "Storniert", color: "bg-red-500/15 text-red-400 border-red-500/30" },
  failed: { label: "Fehlgeschlagen", color: "bg-red-500/15 text-red-400 border-red-500/30" },
};

const PAYMENT_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: "Ausstehend", color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  paid: { label: "Bezahlt", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  failed: { label: "Fehlgeschlagen", color: "bg-red-500/15 text-red-400 border-red-500/30" },
  refunded: { label: "Erstattet", color: "bg-slate-500/15 text-slate-400 border-slate-500/30" },
};

const PAGE_SIZE = 25;

export function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("orders")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (statusFilter !== "all") query = query.eq("status", statusFilter);
      if (paymentFilter !== "all") query = query.eq("payment_status", paymentFilter);
      if (search.trim()) {
        query = query.or(
          `order_number.ilike.%${search}%,email.ilike.%${search}%,nachname.ilike.%${search}%,vorname.ilike.%${search}%`
        );
      }

      const { data, error, count } = await query;
      if (error) throw error;
      setOrders(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter, paymentFilter]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(0);
      fetchOrders();
    }, 400);
    return () => clearTimeout(timeout);
  }, [search]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("orders-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        fetchOrders();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [page, statusFilter, paymentFilter, search]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: totalCount,
      pageCount: Math.ceil(totalCount / PAGE_SIZE),
    };
  }, [totalCount]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", orderId);
      if (error) throw error;
      fetchOrders();
    } catch (err) {
      console.error("Error updating order:", err);
    }
  };

  const openDetail = (order: Order) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("de-AT", { day: "2-digit", month: "2-digit", year: "2-digit" });

  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" });

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("de-AT", { style: "currency", currency: "EUR" }).format(n);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Suche: Bestellnr., E-Mail, Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-slate-600"
          />
        </div>

        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
          <SelectTrigger className="w-[170px] bg-slate-900 border-slate-700 text-slate-300">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-700">
            <SelectItem value="all">Alle Status</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={paymentFilter} onValueChange={(v) => { setPaymentFilter(v); setPage(0); }}>
          <SelectTrigger className="w-[170px] bg-slate-900 border-slate-700 text-slate-300">
            <SelectValue placeholder="Zahlung" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-700">
            <SelectItem value="all">Alle Zahlungen</SelectItem>
            {Object.entries(PAYMENT_CONFIG).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchOrders}
          className="border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
        >
          <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} />
          Aktualisieren
        </Button>

        <span className="text-xs text-slate-500 ml-auto">
          {totalCount} Bestellung{totalCount !== 1 ? "en" : ""}
        </span>
      </div>

      {/* Table */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400 font-medium">Bestellnr.</TableHead>
                  <TableHead className="text-slate-400 font-medium">Datum</TableHead>
                  <TableHead className="text-slate-400 font-medium">Kunde</TableHead>
                  <TableHead className="text-slate-400 font-medium">Produkt</TableHead>
                  <TableHead className="text-slate-400 font-medium">KG / EZ</TableHead>
                  <TableHead className="text-slate-400 font-medium text-right">Betrag</TableHead>
                  <TableHead className="text-slate-400 font-medium">Status</TableHead>
                  <TableHead className="text-slate-400 font-medium">Zahlung</TableHead>
                  <TableHead className="text-slate-400 font-medium w-8"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-slate-500">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                      Laden...
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-slate-500">
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
                        className="border-slate-800/50 hover:bg-slate-800/30 cursor-pointer transition-colors"
                        onClick={() => openDetail(order)}
                      >
                        <TableCell className="font-mono text-xs text-slate-300">
                          {order.order_number}
                        </TableCell>
                        <TableCell className="text-xs text-slate-400">
                          <div>{formatDate(order.created_at)}</div>
                          <div className="text-slate-500">{formatTime(order.created_at)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-slate-200">
                            {order.vorname} {order.nachname}
                          </div>
                          <div className="text-xs text-slate-500">{order.email}</div>
                        </TableCell>
                        <TableCell className="text-xs text-slate-400">
                          {order.product_name}
                          {order.fast_delivery && (
                            <Badge variant="outline" className="ml-1 text-[10px] px-1 py-0 border-amber-500/30 text-amber-400">
                              Express
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-slate-400 font-mono">
                          <div>{order.katastralgemeinde}</div>
                          <div className="text-slate-500">EZ {order.grundstuecksnummer}</div>
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium text-slate-200">
                          {formatCurrency(order.product_price)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[11px] ${sc.color}`}>
                            {sc.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[11px] ${pc.color}`}>
                            {pc.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
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
          <span className="text-xs text-slate-500">
            Seite {page + 1} von {stats.pageCount}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="border-slate-700 text-slate-400 hover:bg-slate-800 h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= stats.pageCount - 1}
              onClick={() => setPage(page + 1)}
              className="border-slate-700 text-slate-400 hover:bg-slate-800 h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Order Detail Drawer */}
      <OrderDetailDrawer
        order={selectedOrder}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onStatusChange={updateOrderStatus}
      />
    </div>
  );
}
