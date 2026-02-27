import { useState, useEffect, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrdersTab } from "@/components/admin/OrdersTab";
import { ReportsTab } from "@/components/admin/ReportsTab";
import { Package, BarChart3, Shield, Sun, Moon, LogOut, Loader2 } from "lucide-react";
import type { User } from "@supabase/supabase-js";

type Theme = "dark" | "light";
interface ThemeContextType { theme: Theme; isDark: boolean; }
export const AdminThemeContext = createContext<ThemeContextType>({ theme: "dark", isDark: true });
export const useAdminTheme = () => useContext(AdminThemeContext);

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem("admin-theme") as Theme) || "dark");
  const navigate = useNavigate();

  const d = theme === "dark";

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        checkAdmin(session.user.id);
      } else {
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        checkAdmin(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdmin = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("admin_users")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();
      setIsAdmin(!!data && !error);
    } catch {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoginLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Login fehlgeschlagen");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("admin-theme", next);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${d ? "bg-slate-950" : "bg-gray-50"}`}>
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${d ? "bg-slate-950" : "bg-gray-50"}`}>
        <Card className={`w-full max-w-sm ${d ? "bg-slate-900 border-slate-800" : ""}`}>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className={`w-6 h-6 ${d ? "text-emerald-400" : "text-emerald-600"}`} />
              <CardTitle className="text-lg">Admin Login</CardTitle>
            </div>
            <p className={`text-sm ${d ? "text-slate-400" : "text-gray-500"}`}>Grundbuchauszug Administration</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="email"
                placeholder="E-Mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={d ? "bg-slate-800 border-slate-700 text-slate-200" : ""}
              />
              <Input
                type="password"
                placeholder="Passwort"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={d ? "bg-slate-800 border-slate-700 text-slate-200" : ""}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              {user && !isAdmin && (
                <p className="text-sm text-amber-500">Kein Admin-Zugang für dieses Konto.</p>
              )}
              <Button type="submit" disabled={loginLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                {loginLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Anmelden
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <span className={`text-xs ${d ? "text-slate-500" : "text-gray-400"}`}>{user.email}</span>
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
    </AdminThemeContext.Provider>
  );
}
