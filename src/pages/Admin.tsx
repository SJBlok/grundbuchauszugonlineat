import { useState, createContext, useContext } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OrdersTab } from "@/components/admin/OrdersTab";
import { ReportsTab } from "@/components/admin/ReportsTab";
import { Package, BarChart3, Shield, Sun, Moon, Lock, LogOut } from "lucide-react";

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

// API key context
interface AdminApiContextType {
  apiKey: string;
  supabaseUrl: string;
  supabaseKey: string;
}
export const AdminApiContext = createContext<AdminApiContextType>({
  apiKey: "",
  supabaseUrl: "",
  supabaseKey: "",
});
export const useAdminApi = () => useContext(AdminApiContext);

export default function Admin() {
  const [searchParams] = useSearchParams();
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem("admin-theme") as Theme) || "dark"
  );
  const [apiKey, setApiKey] = useState(
    () => sessionStorage.getItem("admin-api-key") || ""
  );
  const [keyInput, setKeyInput] = useState("");
  const [authenticated, setAuthenticated] = useState(
    () => !!sessionStorage.getItem("admin-api-key")
  );
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const isDevMode = import.meta.env.DEV;
  const hasAdminParam = searchParams.get("admin") === "true";
  const hasAccess = isDevMode || hasAdminParam;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async () => {
    setAuthLoading(true);
    setAuthError("");
    try {
      // Validate key by trying to fetch orders
      const res = await fetch(
        `${supabaseUrl}/functions/v1/get-orders?limit=1`,
        {
          headers: {
            "Content-Type": "application/json",
            "apikey": supabaseKey,
            "x-api-key": keyInput,
          },
        }
      );
      if (res.ok) {
        sessionStorage.setItem("admin-api-key", keyInput);
        setApiKey(keyInput);
        setAuthenticated(true);
      } else {
        setAuthError("Ongeldige API sleutel. Probeer opnieuw.");
      }
    } catch {
      setAuthError("Verbindingsfout. Probeer opnieuw.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin-api-key");
    setApiKey("");
    setAuthenticated(false);
    setKeyInput("");
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("admin-theme", next);
  };

  const d = theme === "dark";

  // Login screen
  if (!authenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${d ? "bg-slate-950" : "bg-gray-50"}`}>
        <div className={`w-full max-w-sm p-8 rounded-lg border ${d ? "bg-slate-900 border-slate-800" : "bg-white border-gray-200 shadow-sm"}`}>
          <div className="flex items-center justify-center gap-2 mb-6">
            <Shield className={`w-6 h-6 ${d ? "text-emerald-400" : "text-emerald-600"}`} />
            <span className="text-lg font-semibold">Admin Login</span>
          </div>
          <div className="space-y-4">
            <div>
              <label className={`text-xs font-medium uppercase tracking-wider ${d ? "text-slate-400" : "text-gray-500"}`}>
                API Sleutel
              </label>
              <div className="relative mt-1">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${d ? "text-slate-500" : "text-gray-400"}`} />
                <Input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  placeholder="Voer de API sleutel in..."
                  className={`pl-9 ${d ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-gray-50 border-gray-300"}`}
                />
              </div>
            </div>
            {authError && (
              <p className="text-sm text-red-500">{authError}</p>
            )}
            <Button
              onClick={handleLogin}
              disabled={!keyInput || authLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {authLoading ? "Valideren..." : "Inloggen"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminThemeContext.Provider value={{ theme, isDark: d }}>
      <AdminApiContext.Provider value={{ apiKey, supabaseUrl, supabaseKey }}>
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
                <Button variant="ghost" size="sm" onClick={handleLogout}
                  className={`h-8 w-8 p-0 ${d ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}>
                  <LogOut className="w-4 h-4" />
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
      </AdminApiContext.Provider>
    </AdminThemeContext.Provider>
  );
}
