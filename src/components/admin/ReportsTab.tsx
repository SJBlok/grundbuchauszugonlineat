import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Package, Euro, TrendingUp, Calendar, BarChart3, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { useAdminTheme, useAdminApi } from "@/pages/Admin";

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
  email_sent: boolean;
}

export function ReportsTab() {
  const { isDark: d } = useAdminTheme();
  const { apiKey, supabaseUrl: SUPABASE_URL, supabaseKey: SUPABASE_KEY } = useAdminApi();
  const [orders, setOrders] = useState<Order[]>([]);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch orders via edge function
      const ordersRes = await fetch(
        `${SUPABASE_URL}/functions/v1/get-orders?limit=500`,
        { headers: { "apikey": SUPABASE_KEY, "x-api-key": apiKey } }
      );
      const ordersData = await ordersRes.json();
      if (ordersData.orders) setOrders(ordersData.orders);

      // Fetch reports - these have public read via different policy
      const reportsRes = await fetch(
        `${SUPABASE_URL}/rest/v1/daily_order_reports?select=id,report_date,orders_count,total_revenue,email_sent&order=report_date.desc&limit=30`,
        { headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` } }
      );
      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        setReports(reportsData || []);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fmtCur = (n: number) => new Intl.NumberFormat("de-AT", { style: "currency", currency: "EUR" }).format(n);

  const stats = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    const monthAgo = new Date(now.getTime() - 30 * 86400000);
    const prevMonthStart = new Date(now.getTime() - 60 * 86400000);

    const todayOrders = orders.filter((o) => o.created_at.startsWith(todayStr));
    const weekOrders = orders.filter((o) => new Date(o.created_at) >= weekAgo);
    const monthOrders = orders.filter((o) => new Date(o.created_at) >= monthAgo);
    const prevMonthOrders = orders.filter((o) => new Date(o.created_at) >= prevMonthStart && new Date(o.created_at) < monthAgo);

    const monthRev = monthOrders.reduce((s, o) => s + o.product_price, 0);
    const prevRev = prevMonthOrders.reduce((s, o) => s + o.product_price, 0);

    return {
      todayCount: todayOrders.length,
      todayRevenue: todayOrders.reduce((s, o) => s + o.product_price, 0),
      weekCount: weekOrders.length,
      weekRevenue: weekOrders.reduce((s, o) => s + o.product_price, 0),
      monthCount: monthOrders.length,
      monthRevenue: monthRev,
      revenueChange: prevRev > 0 ? ((monthRev - prevRev) / prevRev) * 100 : 0,
      pendingCount: orders.filter((o) => o.status === "pending" || o.status === "open").length,
      totalRevenue: orders.reduce((s, o) => s + o.product_price, 0),
    };
  }, [orders]);

  const chartData = useMemo(() =>
    reports.slice(0, 14).reverse().map((r) => ({
      date: new Date(r.report_date).toLocaleDateString("de-AT", { day: "2-digit", month: "2-digit" }),
      orders: r.orders_count,
      revenue: r.total_revenue,
    })), [reports]);

  const productBreakdown = useMemo(() => {
    const map: Record<string, { count: number; revenue: number }> = {};
    orders.forEach((o) => {
      const k = o.product_name || "Unbekannt";
      if (!map[k]) map[k] = { count: 0, revenue: 0 };
      map[k].count += 1;
      map[k].revenue += o.product_price;
    });
    return Object.entries(map).sort((a, b) => b[1].revenue - a[1].revenue).map(([name, data]) => ({ name, ...data }));
  }, [orders]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-24 ${d ? "text-slate-500" : "text-gray-400"}`}>
        <BarChart3 className="w-6 h-6 animate-pulse mr-2" />
        Berichte werden geladen...
      </div>
    );
  }

  const StatCard = ({ title, value, subtitle, icon: Icon, trend, alert }: {
    title: string; value: string; subtitle: string; icon: any; trend?: number; alert?: boolean;
  }) => (
    <Card className={`${d ? "bg-slate-900/50 border-slate-800" : "bg-white border-gray-200 shadow-sm"} ${alert ? (d ? "border-amber-500/30" : "border-amber-200") : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs uppercase tracking-wider ${d ? "text-slate-500" : "text-gray-400"}`}>{title}</span>
          <Icon className={`w-4 h-4 ${alert ? "text-amber-400" : d ? "text-slate-600" : "text-gray-300"}`} />
        </div>
        <div className={`text-2xl font-bold ${d ? "text-slate-100" : "text-gray-900"}`}>{value}</div>
        <div className="flex items-center gap-1 mt-1">
          <span className={`text-xs ${d ? "text-slate-400" : "text-gray-500"}`}>{subtitle}</span>
          {trend != null && trend !== 0 && (
            <span className={`text-xs flex items-center ${trend > 0 ? "text-emerald-500" : "text-red-500"}`}>
              {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(trend).toFixed(0)}%
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Heute" value={String(stats.todayCount)} subtitle={fmtCur(stats.todayRevenue)} icon={Calendar} />
        <StatCard title="Diese Woche" value={String(stats.weekCount)} subtitle={fmtCur(stats.weekRevenue)} icon={TrendingUp} />
        <StatCard title="Diesen Monat" value={String(stats.monthCount)} subtitle={fmtCur(stats.monthRevenue)} icon={Euro} trend={stats.revenueChange} />
        <StatCard title="Ausstehend" value={String(stats.pendingCount)} subtitle="Zu verarbeiten" icon={Package} alert={stats.pendingCount > 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className={`lg:col-span-2 ${d ? "bg-slate-900/50 border-slate-800" : "bg-white border-gray-200 shadow-sm"}`}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm font-medium ${d ? "text-slate-400" : "text-gray-500"}`}>Bestellungen letzte 14 Tage</CardTitle>
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
            ) : (
              <div className={`flex items-center justify-center h-[240px] text-sm ${d ? "text-slate-500" : "text-gray-400"}`}>Keine Daten</div>
            )}
          </CardContent>
        </Card>

        <Card className={d ? "bg-slate-900/50 border-slate-800" : "bg-white border-gray-200 shadow-sm"}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm font-medium ${d ? "text-slate-400" : "text-gray-500"}`}>Produktübersicht</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {productBreakdown.map((p) => (
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
              {reports.slice(0, 10).map((r) => (
                <TableRow key={r.id} className={d ? "border-slate-800/50" : "border-gray-50"}>
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
    </div>
  );
}
