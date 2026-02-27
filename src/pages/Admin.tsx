import { useEffect, useState } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrdersTab } from "@/components/admin/OrdersTab";
import { ReportsTab } from "@/components/admin/ReportsTab";
import { Package, BarChart3, Shield } from "lucide-react";

export default function Admin() {
  const [searchParams] = useSearchParams();
  const isDevMode = import.meta.env.DEV;
  const hasAdminParam = searchParams.get("admin") === "true";
  const hasAccess = isDevMode || hasAdminParam;

  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span className="text-base font-semibold tracking-tight text-slate-100">
              Grundbuchauszug
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium">
              Admin
            </span>
          </div>
          <div className="text-xs text-slate-500">
            {new Date().toLocaleDateString("de-AT", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[1400px] mx-auto px-6 py-6">
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="bg-slate-900 border border-slate-800 p-1 h-auto">
            <TabsTrigger
              value="orders"
              className="data-[state=active]:bg-slate-800 data-[state=active]:text-slate-100 text-slate-400 gap-2 px-4 py-2"
            >
              <Package className="w-4 h-4" />
              Bestellungen
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="data-[state=active]:bg-slate-800 data-[state=active]:text-slate-100 text-slate-400 gap-2 px-4 py-2"
            >
              <BarChart3 className="w-4 h-4" />
              Berichte
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <OrdersTab />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
