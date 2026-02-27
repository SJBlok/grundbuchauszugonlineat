import { useEffect, useState, useCallback } from "react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderDetailDrawer } from "./OrderDetailDrawer";
import {
  Search, RefreshCw, ChevronLeft, ChevronRight,
  Clock, CheckCircle2, XCircle, MessageSquare,
} from "lucide-react";
import { useAdminTheme } from "@/pages/Admin";

const STATUS_TABS = [
  { value: "open", label: "Offen", icon: Clock, statuses: ["open", "pending"] },
  { value: "awaiting", label: "Warte auf Kunde", icon: MessageSquare, statuses: ["awaiting_customer"] },
  { value: "processed", label: "Verarbeitet", icon: CheckCircle2, statuses: ["processed", "completed"] },
  { value: "cancelled", label: "Storniert / Erstattet", icon: XCircle, statuses: ["cancelled", "deleted", "failed"] },
];

const PAYMENT_CONFIG: Record<string, { label: string; dark: string; light: string }> = {
  pending: { label: "Ausstehend", dark: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30", light: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  paid: { label: "Bezahlt", dark: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", light: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  failed: { label: "Fehlgeschlagen", dark: "bg-red-500/15 text-red-400 border-red-500/30", light: "bg-red-50 text-red-700 border-red-200" },
  refunded: { label: "Erstattet", dark: "bg-slate-500/15 text-slate-400 border-slate-500/30", light: "bg-gray-50 text-gray-500 border-gray-200" },
};

const PAGE_SIZE = 25;

export function OrdersTab() {
  const { isDark: d } = useAdminTheme();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("open");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tabCounts, setTabCounts] = useState<Record<string, number>>({});

  const fetchCounts = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("orders").select("status");
      if (error || !data) return;
      const counts: Record<string, number> = {};
      for (const tab of STATUS_TABS) {
        counts[tab.value] = data.filter((o) => tab.statuses.includes(o.status)).length;
      }
      setTabCounts(counts);
    } catch {}
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const tab = STATUS_TABS.find((t) => t.value === activeTab);
      const statuses = tab?.statuses || ["open"];

      let query = supabase
        .from("orders")
        .select("*", { count: "exact" })
        .in("status", statuses)
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

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
  }, [page, activeTab, paymentFilter, search]);

  useEffect(() => { fetchOrders(); fetchCounts(); }, [fetchOrders, fetchCounts]);

  useEffect(() => {
    const channel = supabase
      .channel("admin-orders-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => { fetchOrders(); fetchCounts(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchOrders, fetchCounts]);

  const pageCount = Math.ceil(totalCount / PAGE_SIZE);

  const updateOrder = async (orderId: string, updates: Record<string, any>) => {
    const { error } = await supabase.from("orders").update(updates).eq("id", orderId);
    if (error) console.error("Update error:", error);
    else {
      fetchOrders();
      fetchCounts();
      if (selectedOrder?.id === orderId) {
        const { data } = await supabase.from("orders").select("*").eq("id", orderId).single();
        if (data) setSelectedOrder(data);
      }
    }
  };

  const fmt = {
    date: (s: string) => new Date(s).toLocaleDateString("de-AT", { day: "2-digit", month: "2-digit", year: "2-digit" }),
    time: (s: string) => new Date(s).toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" }),
    eur: (n: number) => new Intl.NumberFormat("de-AT", { style: "currency", currency: "EUR" }).format(n),
  };

  return (
    <div className="space-y-4">
      {/* Status Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setPage(0); }}>
        <TabsList className={`w-full justify-start ${d ? "bg-slate-900 border-slate-800" : "bg-gray-100 border-gray-200"} border`}>
          {STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5 text-xs">
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              {tabCounts[tab.value] != null && (
                <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${d ? "bg-slate-800 text-slate-400" : "bg-gray-200 text-gray-600"}`}>
                  {tabCounts[tab.value]}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${d ? "text-slate-500" : "text-gray-400"}`} />
          <Input
            placeholder="Suchen nach Bestellnr., Name, E-Mail..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className={`pl-9 ${d ? "bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500" : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"}`}
          />
        </div>
        <Select value={paymentFilter} onValueChange={(v) => { setPaymentFilter(v); setPage(0); }}>
          <SelectTrigger className={`w-[180px] ${d ? "bg-slate-900 border-slate-700 text-slate-200" : "bg-white border-gray-200 text-gray-900"}`}>
            <SelectValue placeholder="Zahlung" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Zahlungen</SelectItem>
            {Object.entries(PAYMENT_CONFIG).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className={`text-xs whitespace-nowrap ${d ? "text-slate-500" : "text-gray-400"}`}>
          {loading && <RefreshCw className="w-3 h-3 animate-spin inline mr-1" />}
          {totalCount} Bestellung{totalCount !== 1 ? "en" : ""}
        </span>
      </div>

      {/* Table */}
      <Card className={`overflow-hidden ${d ? "bg-slate-900/50 border-slate-800" : "bg-white border-gray-200"}`}>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className={d ? "border-slate-800" : "border-gray-100"}>
                  {["Bestellnr.", "Datum", "Kunde", "Produkt", "KG / EZ", "Betrag", "Zahlung", ""].map((h, i) => (
                    <TableHead key={i} className={`text-xs ${d ? "text-slate-400" : "text-gray-500"}`}>{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-sm">Laden...</TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-sm">Keine Bestellungen in dieser Kategorie</TableCell>
                  </TableRow>
                ) : orders.map((order) => {
                  const pc = PAYMENT_CONFIG[order.payment_status] || PAYMENT_CONFIG.pending;
                  return (
                    <TableRow
                      key={order.id}
                      onClick={() => { setSelectedOrder(order); setDrawerOpen(true); }}
                      className={`cursor-pointer transition-colors ${d ? "border-slate-800/50 hover:bg-slate-800/30" : "border-gray-50 hover:bg-gray-50"}`}
                    >
                      <TableCell className={`font-mono text-xs ${d ? "text-slate-300" : "text-gray-700"}`}>{order.order_number}</TableCell>
                      <TableCell>
                        <div className={`text-xs ${d ? "text-slate-300" : "text-gray-700"}`}>{fmt.date(order.created_at)}</div>
                        <div className={`text-[11px] ${d ? "text-slate-500" : "text-gray-400"}`}>{fmt.time(order.created_at)}</div>
                      </TableCell>
                      <TableCell>
                        <div className={`text-sm ${d ? "text-slate-200" : "text-gray-800"}`}>{order.vorname} {order.nachname}</div>
                        <div className={`text-[11px] ${d ? "text-slate-500" : "text-gray-400"}`}>{order.email}</div>
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs ${d ? "text-slate-300" : "text-gray-700"}`}>{order.product_name}</span>
                        {order.fast_delivery && <Badge variant="outline" className="ml-1 text-[10px] px-1 py-0">Express</Badge>}
                      </TableCell>
                      <TableCell>
                        <div className={`text-xs ${d ? "text-slate-300" : "text-gray-700"}`}>{order.katastralgemeinde}</div>
                        <div className={`text-[11px] ${d ? "text-slate-500" : "text-gray-400"}`}>EZ {order.grundstuecksnummer}</div>
                      </TableCell>
                      <TableCell className={`text-xs font-medium ${d ? "text-slate-200" : "text-gray-800"}`}>{fmt.eur(order.product_price)}</TableCell>
                      <TableCell><Badge variant="outline" className={`text-[10px] ${d ? pc.dark : pc.light}`}>{pc.label}</Badge></TableCell>
                      <TableCell />
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className={`flex items-center justify-between text-xs ${d ? "text-slate-400" : "text-gray-500"}`}>
          <span>Seite {page + 1} von {pageCount}</span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}
              className={`h-8 w-8 p-0 ${d ? "border-slate-700 text-slate-400" : "border-gray-200 text-gray-500"}`}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={page >= pageCount - 1} onClick={() => setPage(page + 1)}
              className={`h-8 w-8 p-0 ${d ? "border-slate-700 text-slate-400" : "border-gray-200 text-gray-500"}`}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <OrderDetailDrawer order={selectedOrder} open={drawerOpen} onOpenChange={setDrawerOpen} onUpdateOrder={updateOrder} onRefresh={() => { fetchOrders(); fetchCounts(); }} />
    </div>
  );
}
