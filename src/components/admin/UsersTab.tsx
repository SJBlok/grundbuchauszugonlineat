import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { UserPlus, Trash2, Key, Loader2, Users, Shield } from "lucide-react";
import { useAdminTheme } from "@/pages/Admin";
import { useToast } from "@/hooks/use-toast";

interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  role: string;
  created_at: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export function UsersTab() {
  const { isDark: d } = useAdminTheme();
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showPassword, setShowPassword] = useState<AdminUser | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changePassword, setChangePassword] = useState("");
  const [saving, setSaving] = useState(false);

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      "Content-Type": "application/json",
      "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      "Authorization": `Bearer ${session?.access_token}`,
    };
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${SUPABASE_URL}/functions/v1/manage-admin-users`, {
        method: "POST",
        headers,
        body: JSON.stringify({ action: "list" }),
      });
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async () => {
    if (!newEmail || !newPassword) return;
    setSaving(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${SUPABASE_URL}/functions/v1/manage-admin-users`, {
        method: "POST",
        headers,
        body: JSON.stringify({ action: "create", email: newEmail, password: newPassword }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast({ title: "Benutzer erstellt", description: newEmail });
      setNewEmail("");
      setNewPassword("");
      setShowCreate(false);
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Fehler", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user: AdminUser) => {
    if (!confirm(`${user.email} wirklich löschen?`)) return;
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${SUPABASE_URL}/functions/v1/manage-admin-users`, {
        method: "POST",
        headers,
        body: JSON.stringify({ action: "delete", user_id: user.user_id }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast({ title: "Benutzer gelöscht", description: user.email });
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Fehler", description: err.message, variant: "destructive" });
    }
  };

  const handlePasswordChange = async () => {
    if (!showPassword || !changePassword) return;
    setSaving(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${SUPABASE_URL}/functions/v1/manage-admin-users`, {
        method: "POST",
        headers,
        body: JSON.stringify({ action: "update_password", user_id: showPassword.user_id, password: changePassword }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast({ title: "Passwort geändert", description: showPassword.email });
      setChangePassword("");
      setShowPassword(null);
    } catch (err: any) {
      toast({ title: "Fehler", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className={`w-5 h-5 ${d ? "text-slate-400" : "text-gray-500"}`} />
          <span className={`text-sm ${d ? "text-slate-400" : "text-gray-500"}`}>
            {users.length} Admin-Benutzer
          </span>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)} className="gap-1">
          <UserPlus className="w-3.5 h-3.5" />
          Neuer Benutzer
        </Button>
      </div>

      <Card className={`overflow-hidden ${d ? "bg-slate-900/50 border-slate-800" : "bg-white border-gray-200"}`}>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className={d ? "border-slate-800" : "border-gray-100"}>
                <TableHead className={`text-xs ${d ? "text-slate-400" : "text-gray-500"}`}>E-Mail</TableHead>
                <TableHead className={`text-xs ${d ? "text-slate-400" : "text-gray-500"}`}>Rolle</TableHead>
                <TableHead className={`text-xs ${d ? "text-slate-400" : "text-gray-500"}`}>Erstellt</TableHead>
                <TableHead className={`text-xs ${d ? "text-slate-400" : "text-gray-500"}`}>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-sm">Laden...</TableCell>
                </TableRow>
              ) : users.map((user) => (
                <TableRow key={user.id} className={d ? "border-slate-800/50" : "border-gray-50"}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Shield className={`w-3.5 h-3.5 ${d ? "text-emerald-400" : "text-emerald-600"}`} />
                      <span className={`text-sm ${d ? "text-slate-200" : "text-gray-800"}`}>{user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] ${d ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className={`text-xs ${d ? "text-slate-400" : "text-gray-500"}`}>
                    {new Date(user.created_at).toLocaleDateString("de-AT", { day: "numeric", month: "short", year: "numeric" })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setShowPassword(user)}
                        className={`h-8 w-8 p-0 ${d ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"}`}>
                        <Key className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(user)}
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className={d ? "bg-slate-900 border-slate-800 text-slate-100" : ""}>
          <DialogHeader>
            <DialogTitle>Neuen Admin-Benutzer erstellen</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="E-Mail" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
              className={d ? "bg-slate-800 border-slate-700 text-slate-200" : ""} />
            <Input placeholder="Passwort" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              className={d ? "bg-slate-800 border-slate-700 text-slate-200" : ""} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Abbrechen</Button>
            <Button onClick={handleCreate} disabled={saving || !newEmail || !newPassword}>
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />}
              Erstellen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={!!showPassword} onOpenChange={() => setShowPassword(null)}>
        <DialogContent className={d ? "bg-slate-900 border-slate-800 text-slate-100" : ""}>
          <DialogHeader>
            <DialogTitle>Passwort ändern</DialogTitle>
          </DialogHeader>
          <p className={`text-sm ${d ? "text-slate-400" : "text-gray-500"}`}>{showPassword?.email}</p>
          <Input placeholder="Neues Passwort" type="password" value={changePassword} onChange={(e) => setChangePassword(e.target.value)}
            className={d ? "bg-slate-800 border-slate-700 text-slate-200" : ""} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPassword(null)}>Abbrechen</Button>
            <Button onClick={handlePasswordChange} disabled={saving || !changePassword}>
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />}
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
