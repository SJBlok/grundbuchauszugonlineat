import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Package, Euro, TrendingUp, Calendar, BarChart3, ArrowUpRight, ArrowDownRight,
  CheckCircle, Clock, Mail, ArrowLeft,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useAdminTheme } from "@/pages/Admin";

interface Order {
  id: string;
  product_name: string;
  product_price: number;
  status: string;
  created_at: string;
}

interface DailyReport {
  id: string;
  report_date: string;
  orders_count: number;
  total_revenue: number;
  orders_data: any[];
  email_sent: boolean;
  sent_at: string | null;
}

export function ReportsTab() {
  const { isDark: d } = useAdminTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [o, r] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("daily_order_reports").select("*").order("report_date", { ascending: false }).limit(30),
      ]);
      if (o.data) setOrders(o.data);
      if (r.data) setReports(r.data as any);
      setLoading(false);
    };
    load();
  }, []);

  const fmtCur = (n: number) => new Intl.NumberFormat("de-AT", { style: "currency", currency: "EUR" }).format(n);
  const fmtDate = (s: string) => new Date(s).toLocaleDateString("de-AT", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const fmtTime = (s: string) => new Date(s).toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" });

  const stats = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    const monthAgo = new Date(now.getTime() - 30 * 86400000);
    const prev = new Date(now.getTime() - 60 * 86400000);
    const t = orders.filter(o => o.created_at.startsWith(todayStr));
    const w = orders.filter(o => new Date(o.created_at) >= weekAgo);
    const m = orders.filter(o => new Date(o.created_at) >= monthAgo);
    const p = orders.filter(o => new Date(o.created_at) >= prev && new Date(o.created_at) < monthAgo);
    const mr = m.reduce((s, o) => s + o.product_price, 0);
    const pr = p.reduce((s, o) => s + o.product_price, 0);
    return {
      todayCount: t.length, todayRevenue: t.reduce((s, o) => s + o.product_price, 0),
      weekCount: w.length, weekRevenue: w.reduce((s, o) => s + o.product_price, 0),
      monthCount: m.length, monthRevenue: mr,
      change: pr > 0 ? ((mr - pr) / pr) * 100 : 0,
      pending: orders.filter(o => o.status === "pending" || o.status === "open").length,
      totalRevenue: orders.reduce((s, o) => s + o.product_price, 0),
    };
  }, [orders]);

  const todayReport = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const todayOrders = orders.filter(o => o.created_at.startsWith(todayStr));
    // Don't show if an official report already exists for today
    const hasOfficialReport = reports.some(r => r.report_date === todayStr);
    if (hasOfficialReport) return null;
    return {
      id: "__today__",
      report_date: todayStr,
      orders_count: todayOrders.length,
      total_revenue: todayOrders.reduce((s, o) => s + o.product_price, 0),
      orders_data: todayOrders,
      email_sent: false,
      sent_at: null,
      _isPreview: true,
    } as DailyReport & { _isPreview?: boolean };
  }, [orders, reports]);

  const chartData = useMemo(() => reports.slice(0, 14).reverse().map(r => ({
    date: new Date(r.report_date).toLocaleDateString("de-AT", { day: "2-digit", month: "2-digit" }),
    orders: r.orders_count, revenue: r.total_revenue,
  })), [reports]);

  const products = useMemo(() => {
    const m: Record<string, { count: number; revenue: number }> = {};
    orders.forEach(o => { const k = o.product_name || "?"; if (!m[k]) m[k] = { count: 0, revenue: 0 }; m[k].count++; m[k].revenue += o.product_price; });
    return Object.entries(m).sort((a, b) => b[1].revenue - a[1].revenue).map(([name, data]) => ({ name, ...data }));
  }, [orders]);

  if (loading) return (
    <div className={`flex items-center justify-center py-24 ${d ? "text-slate-500" : "text-gray-400"}`}>
      <BarChart3 className="w-6 h-6 animate-pulse mr-2" />Laden...
    </div>
  );

  const Stat = ({ title, value, sub, icon: I, trend, alert }: { title: string; value: string; sub: string; icon: any; trend?: number; alert?: boolean }) => (
    <Card className={`${d ? "bg-slate-900/50 border-slate-800" : "bg-white border-gray-200 shadow-sm"} ${alert ? (d ? "border-amber-500/30" : "border-amber-200") : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs uppercase tracking-wider ${d ? "text-slate-500" : "text-gray-400"}`}>{title}</span>
          <I className={`w-4 h-4 ${alert ? "text-amber-400" : d ? "text-slate-600" : "text-gray-300"}`} />
        </div>
        <div className={`text-2xl font-bold ${d ? "text-slate-100" : "text-gray-900"}`}>{value}</div>
        <div className="flex items-center gap-1 mt-1">
          <span className={`text-xs ${d ? "text-slate-400" : "text-gray-500"}`}>{sub}</span>
          {trend != null && trend !== 0 && <span className={`text-xs flex items-center ${trend > 0 ? "text-emerald-500" : "text-red-500"}`}>
            {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{Math.abs(trend).toFixed(0)}%
          </span>}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat title="Heute" value={String(stats.todayCount)} sub={fmtCur(stats.todayRevenue)} icon={Calendar} />
        <Stat title="Diese Woche" value={String(stats.weekCount)} sub={fmtCur(stats.weekRevenue)} icon={TrendingUp} />
        <Stat title="Diesen Monat" value={String(stats.monthCount)} sub={fmtCur(stats.monthRevenue)} icon={Euro} trend={stats.change} />
        <Stat title="Ausstehend" value={String(stats.pending)} sub="Zu verarbeiten" icon={Package} alert={stats.pending > 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className={`lg:col-span-2 ${d ? "bg-slate-900/50 border-slate-800" : "bg-white border-gray-200 shadow-sm"}`}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm font-medium ${d ? "text-slate-400" : "text-gray-500"}`}>Bestellungen 14 Tage</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke={d ? "#1e293b" : "#f1f5f9"} />
                  <XAxis dataKey="date" tick={{ fill: d ? "#64748b" : "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: d ? "#64748b" : "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: d ? "#0f172a" : "#fff", border: `1px solid ${d ? "#334155" : "#e2e8f0"}`, borderRadius: "8px", fontSize: "12px" }}
                    formatter={(value: number, name: string) => name === "revenue" ? [fmtCur(value), "Umsatz"] : [value, "Bestellungen"]}
                  />
                  <Bar dataKey="orders" fill={d ? "#10b981" : "#059669"} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className={`flex items-center justify-center h-[240px] text-sm ${d ? "text-slate-500" : "text-gray-400"}`}>Keine Daten</div>}
          </CardContent>
        </Card>

        <Card className={d ? "bg-slate-900/50 border-slate-800" : "bg-white border-gray-200 shadow-sm"}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm font-medium ${d ? "text-slate-400" : "text-gray-500"}`}>Produkte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {products.map(p => (
              <div key={p.name} className="flex items-center justify-between">
                <div>
                  <div className={`text-sm ${d ? "text-slate-200" : "text-gray-800"}`}>{p.name}</div>
                  <div className={`text-xs ${d ? "text-slate-500" : "text-gray-400"}`}>{p.count}×</div>
                </div>
                <div className={`text-sm font-medium ${d ? "text-slate-200" : "text-gray-800"}`}>{fmtCur(p.revenue)}</div>
              </div>
            ))}
            <div className={`pt-3 border-t flex items-center justify-between ${d ? "border-slate-800" : "border-gray-100"}`}>
              <span className={`text-sm font-medium ${d ? "text-slate-300" : "text-gray-600"}`}>Gesamt</span>
              <span className="text-sm font-semibold text-emerald-500">{fmtCur(stats.totalRevenue)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Reports Table */}
      <Card className={d ? "bg-slate-900/50 border-slate-800" : "bg-white border-gray-200 shadow-sm"}>
        <CardHeader className="pb-2">
          <CardTitle className={`text-sm font-medium ${d ? "text-slate-400" : "text-gray-500"}`}>Tägliche Berichte</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className={`${d ? "border-slate-800" : "border-gray-100"} hover:bg-transparent`}>
                <TableHead className={d ? "text-slate-400" : "text-gray-500"}>Datum</TableHead>
                <TableHead className={`text-right ${d ? "text-slate-400" : "text-gray-500"}`}>Bestellungen</TableHead>
                <TableHead className={`text-right ${d ? "text-slate-400" : "text-gray-500"}`}>Umsatz</TableHead>
                <TableHead className={d ? "text-slate-400" : "text-gray-500"}>E-Mail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Today's preliminary report */}
              {todayReport && (
                <TableRow
                  className={`cursor-pointer transition-colors ${d ? "border-slate-800/50 hover:bg-slate-800/30 bg-slate-900/30" : "border-gray-50 hover:bg-gray-50 bg-amber-50/30"}`}
                  onClick={() => setSelectedReport(todayReport)}
                >
                  <TableCell className={`text-sm font-medium ${d ? "text-slate-200" : "text-gray-800"}`}>
                    Heute
                  </TableCell>
                  <TableCell className={`text-sm text-right ${d ? "text-slate-300" : "text-gray-700"}`}>{todayReport.orders_count}</TableCell>
                  <TableCell className={`text-sm text-right font-medium ${d ? "text-slate-200" : "text-gray-800"}`}>{fmtCur(todayReport.total_revenue)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[11px] ${d ? "bg-amber-500/15 text-amber-400 border-amber-500/30" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                      Vorläufig
                    </Badge>
                  </TableCell>
                </TableRow>
              )}
              {reports.slice(0, 14).map(r => (
                <TableRow
                  key={r.id}
                  className={`cursor-pointer transition-colors ${d ? "border-slate-800/50 hover:bg-slate-800/30" : "border-gray-50 hover:bg-gray-50"}`}
                  onClick={() => setSelectedReport(r)}
                >
                  <TableCell className={`text-sm ${d ? "text-slate-300" : "text-gray-700"}`}>
                    {new Date(r.report_date).toLocaleDateString("de-AT", { weekday: "short", day: "numeric", month: "short" })}
                  </TableCell>
                  <TableCell className={`text-sm text-right ${d ? "text-slate-300" : "text-gray-700"}`}>{r.orders_count}</TableCell>
                  <TableCell className={`text-sm text-right font-medium ${d ? "text-slate-200" : "text-gray-800"}`}>{fmtCur(r.total_revenue)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[11px] ${r.email_sent
                      ? (d ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-emerald-50 text-emerald-700 border-emerald-200")
                      : (d ? "bg-slate-500/15 text-slate-400 border-slate-500/30" : "bg-gray-50 text-gray-500 border-gray-200")}`}>
                      {r.email_sent ? "Gesendet" : "Ausstehend"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Report Detail Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={(open) => { if (!open) setSelectedReport(null); }}>
        <DialogContent className={`max-w-3xl max-h-[85vh] overflow-y-auto p-0 gap-0 ${d ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-white border-gray-200 text-gray-900"}`}>
          {selectedReport && (() => {
            const ordersData = selectedReport.orders_data || [];
            
            // Product breakdown
            const aktuellOrders = ordersData.filter((o: any) => {
              const name = (o.product_name || "").toLowerCase();
              return !name.includes("historisch") && !name.includes("kombi");
            });
            const historischOrders = ordersData.filter((o: any) => (o.product_name || "").toLowerCase().includes("historisch"));
            const kombiOrders = ordersData.filter((o: any) => (o.product_name || "").toLowerCase().includes("kombi"));
            const signaturCount = ordersData.filter((o: any) => o.amtliche_signatur === true).length;
            const priorityCount = ordersData.filter((o: any) => o.fast_delivery === true).length;
            const digitalCount = ordersData.filter((o: any) => o.digital_storage_subscription === true).length;

            const aktuellRevenue = aktuellOrders.reduce((s: number, o: any) => s + (o.product_price || 0), 0);
            const historischRevenue = historischOrders.reduce((s: number, o: any) => s + (o.product_price || 0), 0);
            const kombiRevenue = kombiOrders.reduce((s: number, o: any) => s + (o.product_price || 0), 0);
            const signaturRevenue = signaturCount * 2.95;
            const priorityRevenue = priorityCount * 9.95;
            const digitalRevenue = digitalCount * 7.95;

            // Parse UVST costs from processing_notes
            let totalUvstCosts = 0;
            const uvstSearchCosts: number[] = [];
            const uvstDocCosts: number[] = [];
            ordersData.forEach((o: any) => {
              const notes = o.processing_notes || "";
              // Match cost lines: ... UVST GT_GBA/GT_GBP ... — €X.XX
              const costMatches = notes.matchAll(/UVST\s+(GT_\w+).*?€([\d.,]+)/g);
              for (const m of costMatches) {
                const cost = parseFloat(m[2].replace(",", "."));
                if (!isNaN(cost)) {
                  totalUvstCosts += cost;
                  uvstDocCosts.push(cost);
                }
              }
              // Match search/lookup costs if logged
              const searchMatches = notes.matchAll(/(?:search|lookup|suche).*?€([\d.,]+)/gi);
              for (const m of searchMatches) {
                const cost = parseFloat(m[1].replace(",", "."));
                if (!isNaN(cost)) {
                  uvstSearchCosts.push(cost);
                }
              }
            });
            const totalSearchCost = uvstSearchCosts.reduce((s, c) => s + c, 0);
            const totalDocCost = uvstDocCosts.reduce((s, c) => s + c, 0);

            return (
              <>
                {/* Header */}
                <div className={`sticky top-0 z-10 px-6 py-4 border-b ${d ? "bg-slate-950 border-slate-800" : "bg-white border-gray-200"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedReport(null)}
                        className={`h-8 w-8 p-0 ${d ? "text-slate-400 hover:bg-slate-800" : "text-gray-500 hover:bg-gray-100"}`}>
                        <ArrowLeft className="w-4 h-4" />
                      </Button>
                      <div>
                        <h2 className={`text-lg font-semibold ${d ? "text-slate-100" : "text-gray-900"}`}>{fmtDate(selectedReport.report_date)}</h2>
                        {selectedReport.email_sent && selectedReport.sent_at && (
                          <span className={`text-xs flex items-center gap-1 ${d ? "text-slate-500" : "text-gray-400"}`}>
                            <Mail className="w-3 h-3" /> Gesendet um {fmtTime(selectedReport.sent_at)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-xs ${(selectedReport as any)._isPreview
                      ? (d ? "bg-amber-500/15 text-amber-400 border-amber-500/30" : "bg-amber-50 text-amber-700 border-amber-200")
                      : selectedReport.email_sent
                      ? (d ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-emerald-50 text-emerald-700 border-emerald-200")
                      : (d ? "bg-slate-500/15 text-slate-400 border-slate-500/30" : "bg-gray-50 text-gray-500 border-gray-200")}`}>
                      {(selectedReport as any)._isPreview ? "Vorläufig" : selectedReport.email_sent ? <><CheckCircle className="w-3 h-3 mr-1" />Gesendet</> : <><Clock className="w-3 h-3 mr-1" />Ausstehend</>}
                    </Badge>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  {/* Summary cards */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className={`rounded-lg p-4 text-center ${d ? "bg-slate-900/50 border border-slate-800" : "bg-gray-50"}`}>
                      <p className={`text-3xl font-bold ${d ? "text-slate-100" : "text-gray-900"}`}>{selectedReport.orders_count}</p>
                      <p className={`text-sm ${d ? "text-slate-400" : "text-gray-500"}`}>Bestellungen</p>
                    </div>
                    <div className={`rounded-lg p-4 text-center ${d ? "bg-slate-900/50 border border-slate-800" : "bg-gray-50"}`}>
                      <p className={`text-3xl font-bold ${d ? "text-slate-100" : "text-gray-900"}`}>{fmtCur(selectedReport.total_revenue)}</p>
                      <p className={`text-sm ${d ? "text-slate-400" : "text-gray-500"}`}>Umsatz</p>
                    </div>
                    <div className={`rounded-lg p-4 text-center ${d ? "bg-slate-900/50 border border-slate-800" : "bg-gray-50"}`}>
                      <p className={`text-3xl font-bold text-red-500`}>{fmtCur(totalUvstCosts)}</p>
                      <p className={`text-sm ${d ? "text-slate-400" : "text-gray-500"}`}>UVST Kosten</p>
                    </div>
                  </div>

                   {/* Revenue breakdown */}
                  <Card className={d ? "bg-slate-900/50 border-slate-800" : "border-gray-200"}>
                    <CardHeader className="pb-0 pt-3 px-4">
                      <CardTitle className={`text-xs uppercase tracking-wider ${d ? "text-slate-500" : "text-gray-400"}`}>Umsatz</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 text-sm">
                      <div className={`flex justify-between px-4 py-3 ${d ? "text-slate-300" : "text-gray-700"}`}>
                        <span>{aktuellOrders.length}× Aktueller Grundbuchauszug</span>
                        <span className="font-medium">{fmtCur(aktuellRevenue)}</span>
                      </div>
                      <div className={`flex justify-between px-4 py-3 border-t ${d ? "border-slate-800 text-slate-300" : "border-gray-100 text-gray-700"}`}>
                        <span>{historischOrders.length}× Historischer Grundbuchauszug</span>
                        <span className="font-medium">{fmtCur(historischRevenue)}</span>
                      </div>
                      <div className={`flex justify-between px-4 py-3 border-t ${d ? "border-slate-800 text-violet-400" : "border-gray-100 text-violet-600"}`}>
                        <span>{kombiOrders.length}× Grundbuch Kombi-Pack</span>
                        <span className="font-medium">{fmtCur(kombiRevenue)}</span>
                      </div>
                      <div className={`flex justify-between px-4 py-3 border-t ${d ? "border-slate-800 text-cyan-400" : "border-gray-100 text-cyan-600"}`}>
                        <span>{signaturCount}× Amtliche Signatur à € 2,95</span>
                        <span className="font-medium">{fmtCur(signaturRevenue)}</span>
                      </div>
                      <div className={`flex justify-between px-4 py-3 border-t ${d ? "border-slate-800 text-amber-400" : "border-gray-100 text-amber-600"}`}>
                        <span>{priorityCount}× Priority Delivery à € 9,95</span>
                        <span className="font-medium">{fmtCur(priorityRevenue)}</span>
                      </div>
                      <div className={`flex justify-between px-4 py-3 border-t ${d ? "border-slate-800 text-blue-400" : "border-gray-100 text-blue-600"}`}>
                        <span>{digitalCount}× Digitale Speicherung à € 7,95</span>
                        <span className="font-medium">{fmtCur(digitalRevenue)}</span>
                      </div>
                      <div className={`flex justify-between px-4 py-3 border-t font-semibold ${d ? "border-slate-800 bg-slate-800/50 text-slate-100" : "border-gray-100 bg-gray-50 text-gray-900"}`}>
                        <span>Gesamt</span>
                        <span className="text-emerald-500">{fmtCur(selectedReport.total_revenue)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* UVST Cost overview */}
                  <Card className={d ? "bg-slate-900/50 border-slate-800" : "border-gray-200"}>
                    <CardHeader className="pb-0 pt-3 px-4">
                      <CardTitle className={`text-xs uppercase tracking-wider ${d ? "text-slate-500" : "text-gray-400"}`}>UVST Kosten</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 text-sm">
                      <div className={`flex justify-between px-4 py-3 ${d ? "text-slate-300" : "text-gray-700"}`}>
                        <span>API Suchkosten</span>
                        <span className="font-medium text-red-500">{fmtCur(totalSearchCost)}</span>
                      </div>
                      <div className={`flex justify-between px-4 py-3 border-t ${d ? "border-slate-800 text-slate-300" : "border-gray-100 text-gray-700"}`}>
                        <span>Dokumentabruf ({uvstDocCosts.length}×)</span>
                        <span className="font-medium text-red-500">{fmtCur(totalDocCost)}</span>
                      </div>
                      <div className={`flex justify-between px-4 py-3 border-t font-semibold ${d ? "border-slate-800 bg-slate-800/50 text-slate-100" : "border-gray-100 bg-gray-50 text-gray-900"}`}>
                        <span>Gesamt UVST</span>
                        <span className="text-red-500">{fmtCur(totalUvstCosts)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Orders table */}
                  {ordersData.length > 0 ? (
                    <Card className={d ? "bg-slate-900/50 border-slate-800" : "border-gray-200"}>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow className={d ? "border-slate-800 hover:bg-transparent" : "border-gray-100 hover:bg-transparent"}>
                              <TableHead className={d ? "text-slate-400" : "text-gray-500"}>Bestellnr.</TableHead>
                              <TableHead className={d ? "text-slate-400" : "text-gray-500"}>Kunde</TableHead>
                              <TableHead className={d ? "text-slate-400" : "text-gray-500"}>KG</TableHead>
                              <TableHead className={d ? "text-slate-400" : "text-gray-500"}>EZ</TableHead>
                              <TableHead className={`text-right ${d ? "text-slate-400" : "text-gray-500"}`}>Betrag</TableHead>
                              <TableHead className={d ? "text-slate-400" : "text-gray-500"}>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {ordersData.map((order: any) => (
                              <TableRow key={order.id} className={d ? "border-slate-800/50" : "border-gray-50"}>
                                <TableCell className={`font-mono text-sm ${d ? "text-slate-300" : "text-gray-700"}`}>{order.order_number}</TableCell>
                                <TableCell className={`text-sm ${d ? "text-slate-300" : "text-gray-700"}`}>{order.vorname} {order.nachname}</TableCell>
                                <TableCell className={`text-sm ${d ? "text-slate-500" : "text-gray-400"}`}>{order.katastralgemeinde}</TableCell>
                                <TableCell className={`text-sm ${d ? "text-slate-500" : "text-gray-400"}`}>{order.grundstuecksnummer}</TableCell>
                                <TableCell className={`text-sm text-right font-medium ${d ? "text-slate-200" : "text-gray-800"}`}>{fmtCur(order.product_price)}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={`text-[11px] ${d ? "text-slate-400 border-slate-700" : "text-gray-500 border-gray-200"}`}>{order.status}</Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className={`text-center py-8 text-sm ${d ? "text-slate-500" : "text-gray-400"}`}>Keine Bestellungen an diesem Tag</div>
                  )}
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
