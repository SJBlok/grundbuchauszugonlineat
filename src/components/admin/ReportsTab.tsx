import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
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
import type { Tables } from "@/integrations/supabase/types";

type Order = Tables<"orders">;

interface DailyReport {
  id: string;
  report_date: string;
  orders_count: number;
  total_revenue: number;
  orders_data: any[];
  email_sent: boolean;
}

export function ReportsTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, reportsRes] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        (supabase as any).from("daily_order_reports").select("*").order("report_date", { ascending: false }).limit(30),
      ]);
      if (ordersRes.data) setOrders(ordersRes.data);
      if (reportsRes.data) setReports(reportsRes.data);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("de-AT", { style: "currency", currency: "EUR" }).format(n);

  // Compute stats
  const stats = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    const monthAgo = new Date(now.getTime() - 30 * 86400000);
    const prevMonthStart = new Date(now.getTime() - 60 * 86400000);

    const todayOrders = orders.filter((o) => o.created_at.startsWith(todayStr));
    const weekOrders = orders.filter((o) => new Date(o.created_at) >= weekAgo);
    const monthOrders = orders.filter((o) => new Date(o.created_at) >= monthAgo);
    const prevMonthOrders = orders.filter(
      (o) => new Date(o.created_at) >= prevMonthStart && new Date(o.created_at) < monthAgo
    );

    const monthRevenue = monthOrders.reduce((s, o) => s + o.product_price, 0);
    const prevMonthRevenue = prevMonthOrders.reduce((s, o) => s + o.product_price, 0);
    const revenueChange = prevMonthRevenue > 0
      ? ((monthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100
      : 0;

    const avgOrderValue = orders.length > 0
      ? orders.reduce((s, o) => s + o.product_price, 0) / orders.length
      : 0;

    const pendingCount = orders.filter((o) => o.status === "pending").length;

    return {
      todayCount: todayOrders.length,
      todayRevenue: todayOrders.reduce((s, o) => s + o.product_price, 0),
      weekCount: weekOrders.length,
      weekRevenue: weekOrders.reduce((s, o) => s + o.product_price, 0),
      monthCount: monthOrders.length,
      monthRevenue,
      revenueChange,
      avgOrderValue,
      totalOrders: orders.length,
      totalRevenue: orders.reduce((s, o) => s + o.product_price, 0),
      pendingCount,
    };
  }, [orders]);

  // Chart data from daily reports
  const chartData = useMemo(() => {
    return reports
      .slice(0, 14)
      .reverse()
      .map((r) => ({
        date: new Date(r.report_date).toLocaleDateString("de-AT", { day: "2-digit", month: "2-digit" }),
        orders: r.orders_count,
        revenue: r.total_revenue,
      }));
  }, [reports]);

  // Product breakdown
  const productBreakdown = useMemo(() => {
    const map: Record<string, { count: number; revenue: number }> = {};
    orders.forEach((o) => {
      const key = o.product_name || "Unbekannt";
      if (!map[key]) map[key] = { count: 0, revenue: 0 };
      map[key].count += 1;
      map[key].revenue += o.product_price;
    });
    return Object.entries(map)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .map(([name, data]) => ({ name, ...data }));
  }, [orders]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500">
        <BarChart3 className="w-6 h-6 animate-pulse mr-2" />
        Berichte werden geladen...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Heute"
          value={stats.todayCount.toString()}
          subtitle={formatCurrency(stats.todayRevenue)}
          icon={Calendar}
        />
        <StatCard
          title="Diese Woche"
          value={stats.weekCount.toString()}
          subtitle={formatCurrency(stats.weekRevenue)}
          icon={TrendingUp}
        />
        <StatCard
          title="Diesen Monat"
          value={stats.monthCount.toString()}
          subtitle={formatCurrency(stats.monthRevenue)}
          icon={Euro}
          trend={stats.revenueChange}
        />
        <StatCard
          title="Ausstehend"
          value={stats.pendingCount.toString()}
          subtitle="Zu verarbeiten"
          icon={Package}
          alert={stats.pendingCount > 0}
        />
      </div>

      {/* Chart + Product Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart */}
        <Card className="bg-slate-900/50 border-slate-800 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Bestellungen letzte 14 Tage
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    labelStyle={{ color: "#94a3b8" }}
                    itemStyle={{ color: "#e2e8f0" }}
                    formatter={(value: number, name: string) =>
                      name === "revenue" ? [formatCurrency(value), "Umsatz"] : [value, "Bestellungen"]
                    }
                  />
                  <Bar dataKey="orders" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[240px] text-slate-500 text-sm">
                Keine Daten vorhanden
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Breakdown */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Produktübersicht
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {productBreakdown.map((p) => (
              <div key={p.name} className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-200">{p.name}</div>
                  <div className="text-xs text-slate-500">{p.count} Bestellung{p.count !== 1 ? "en" : ""}</div>
                </div>
                <div className="text-sm font-medium text-slate-200">{formatCurrency(p.revenue)}</div>
              </div>
            ))}
            {productBreakdown.length === 0 && (
              <div className="text-sm text-slate-500 text-center py-4">Keine Daten</div>
            )}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="text-sm font-medium text-slate-300">Gesamt</div>
              <div className="text-sm font-semibold text-emerald-400">{formatCurrency(stats.totalRevenue)}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Daily Reports */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-400">
            Tägliche Berichte
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400">Datum</TableHead>
                <TableHead className="text-slate-400 text-right">Bestellungen</TableHead>
                <TableHead className="text-slate-400 text-right">Umsatz</TableHead>
                <TableHead className="text-slate-400">E-Mail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.slice(0, 10).map((r) => (
                <TableRow key={r.id} className="border-slate-800/50">
                  <TableCell className="text-sm text-slate-300">
                    {new Date(r.report_date).toLocaleDateString("de-AT", {
                      weekday: "short", day: "numeric", month: "short",
                    })}
                  </TableCell>
                  <TableCell className="text-sm text-slate-300 text-right">{r.orders_count}</TableCell>
                  <TableCell className="text-sm text-slate-200 text-right font-medium">
                    {formatCurrency(r.total_revenue)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[11px] ${
                        r.email_sent
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          : "bg-slate-500/15 text-slate-400 border-slate-500/30"
                      }`}
                    >
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

// Stat Card Component
function StatCard({ title, value, subtitle, icon: Icon, trend, alert }: {
  title: string;
  value: string;
  subtitle: string;
  icon: any;
  trend?: number;
  alert?: boolean;
}) {
  return (
    <Card className={`bg-slate-900/50 border-slate-800 ${alert ? "border-amber-500/30" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-500 uppercase tracking-wider">{title}</span>
          <Icon className={`w-4 h-4 ${alert ? "text-amber-400" : "text-slate-600"}`} />
        </div>
        <div className="text-2xl font-bold text-slate-100">{value}</div>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs text-slate-400">{subtitle}</span>
          {trend != null && trend !== 0 && (
            <span className={`text-xs flex items-center ${trend > 0 ? "text-emerald-400" : "text-red-400"}`}>
              {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(trend).toFixed(0)}%
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
