import { useState, createContext, useContext } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { OrdersTab } from "@/components/admin/OrdersTab";
import { ReportsTab } from "@/components/admin/ReportsTab";
import { Package, BarChart3, Shield, Sun, Moon } from "lucide-react";

// Theme context
type Theme = "dark" | "light";
interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
}
export const AdminThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  isDark: true,
});
export const useAdminTheme = () => useContext(AdminThemeContext);

export default function Admin() {
  const [searchParams] = useSearchParams();
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem("admin-theme") as Theme) || "dark"
  );

  const isDevMode = import.meta.env.DEV;
  const hasAdminParam = searchParams.get("admin") === "true";
  const hasAccess = isDevMode || hasAdminParam;

  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("admin-theme", next);
  };

  const d = theme === "dark";

  return (
    <AdminThemeContext.Provider value={{ theme, isDark: d }}>
      <div className={`min-h-screen transition-colors ${d ? "bg-slate-950 text-slate-100" : "bg-gray-50 text-gray-900"}`}>
        <header className={`border-b backdrop-blur-sm sticky top-0 z-50 ${d ? "border-slate-800 bg-slate-950/80" : "border-gray-200 bg-white/80"}`}>
          <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className={`w-5 h-5 ${d ? "text-emerald-400" : "text-emerald-600"}`} />
              <span className="text-base font-semibold tracking-tight">Grundbuchauszug</span>
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${d ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
                Admin
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs ${d ? "text-slate-500" : "text-gray-400"}`}>
                {new Date().toLocaleDateString("de-AT", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </span>
              <Button variant="ghost" size="sm" onClick={toggleTheme}
                className={`h-8 w-8 p-0 ${d ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}>
                {d ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-[1400px] mx-auto px-6 py-6">
          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList className={`p-1 h-auto ${d ? "bg-slate-900 border border-slate-800" : "bg-white border border-gray-200 shadow-sm"}`}>
              <TabsTrigger value="orders"
                className={`gap-2 px-4 py-2 ${d ? "data-[state=active]:bg-slate-800 data-[state=active]:text-slate-100 text-slate-400" : "data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 text-gray-500"}`}>
                <Package className="w-4 h-4" />
                Bestellungen
              </TabsTrigger>
              <TabsTrigger value="reports"
                className={`gap-2 px-4 py-2 ${d ? "data-[state=active]:bg-slate-800 data-[state=active]:text-slate-100 text-slate-400" : "data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 text-gray-500"}`}>
                <BarChart3 className="w-4 h-4" />
                Berichte
              </TabsTrigger>
            </TabsList>
            <TabsContent value="orders"><OrdersTab /></TabsContent>
            <TabsContent value="reports"><ReportsTab /></TabsContent>
          </Tabs>
        </main>
      </div>
    </AdminThemeContext.Provider>
  );
}