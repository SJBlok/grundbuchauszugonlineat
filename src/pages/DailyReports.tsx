import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Package, Euro, Mail, CheckCircle, Clock } from "lucide-react";

interface DailyReport {
  id: string;
  report_date: string;
  orders_count: number;
  total_revenue: number;
  orders_data: any[];
  email_sent: boolean;
  sent_at: string | null;
  created_at: string;
}

export default function DailyReports() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      // Using any type to bypass TypeScript issues with new table
      const { data, error } = await (supabase as any)
        .from("daily_order_reports")
        .select("*")
        .order("report_date", { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('de-AT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-AT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('de-AT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
            Daily Order Reports
          </h1>
          <p className="text-muted-foreground">
            Übersicht aller automatisch generierten täglichen Bestellberichte
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reports List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  Berichte
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-6 text-center text-muted-foreground">
                    Laden...
                  </div>
                ) : reports.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    Noch keine Berichte vorhanden
                  </div>
                ) : (
                  <div className="divide-y">
                    {reports.map((report) => (
                      <button
                        key={report.id}
                        onClick={() => setSelectedReport(report)}
                        className={`w-full px-6 py-4 text-left hover:bg-muted/50 transition-colors ${
                          selectedReport?.id === report.id ? 'bg-muted' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">
                            {new Date(report.report_date).toLocaleDateString('de-AT')}
                          </span>
                          {report.email_sent ? (
                            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Gesendet
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              Ausstehend
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            {report.orders_count} Bestellungen
                          </span>
                          <span className="flex items-center gap-1">
                            <Euro className="h-3 w-3" />
                            {formatCurrency(report.total_revenue)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Report Detail */}
          <div className="lg:col-span-2">
            {selectedReport ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">
                      {formatDate(selectedReport.report_date)}
                    </CardTitle>
                    {selectedReport.email_sent && selectedReport.sent_at && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        Gesendet um {formatTime(selectedReport.sent_at)}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Summary */}
                  {(() => {
                    const ordersData = selectedReport.orders_data || [];
                    const priorityCount = ordersData.filter((o: any) => o.fast_delivery === true).length;
                    const basisRevenue = ordersData.length * 28.90;
                    const priorityRevenue = priorityCount * 9.95;
                    return (
                      <>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-muted/50 rounded-lg p-4 text-center">
                            <p className="text-3xl font-bold text-primary mb-1">
                              {selectedReport.orders_count}
                            </p>
                            <p className="text-sm text-muted-foreground">Bestellungen</p>
                          </div>
                          <div className="bg-muted/50 rounded-lg p-4 text-center">
                            <p className="text-3xl font-bold text-primary mb-1">
                              {formatCurrency(selectedReport.total_revenue)}
                            </p>
                            <p className="text-sm text-muted-foreground">Umsatz</p>
                          </div>
                        </div>
                        <div className="border rounded-lg mb-6 text-sm">
                          <div className="flex justify-between px-4 py-3">
                            <span className="text-muted-foreground">{ordersData.length}× Grundbuchauszug à € 28,90</span>
                            <span className="font-medium">{formatCurrency(basisRevenue)}</span>
                          </div>
                          <div className="flex justify-between px-4 py-3 border-t text-amber-600">
                            <span>{priorityCount}× Priority Delivery à € 9,95</span>
                            <span className="font-medium">{formatCurrency(priorityRevenue)}</span>
                          </div>
                          <div className="flex justify-between px-4 py-3 border-t bg-muted/50 font-semibold">
                            <span>Totaal</span>
                            <span className="text-primary">{formatCurrency(selectedReport.total_revenue)}</span>
                          </div>
                        </div>
                      </>
                    );
                  })()}

                  {/* Orders Table */}
                  {selectedReport.orders_data.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Bestellnr.</TableHead>
                          <TableHead>Kunde</TableHead>
                          <TableHead>KG</TableHead>
                          <TableHead>EZ</TableHead>
                          <TableHead className="text-right">Betrag</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedReport.orders_data.map((order: any) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono text-sm">
                              {order.order_number}
                            </TableCell>
                            <TableCell>
                              {order.vorname} {order.nachname}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {order.katastralgemeinde}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {order.grundstuecksnummer}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(order.product_price)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {order.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Keine Bestellungen an diesem Tag
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <CalendarDays className="h-12 w-12 mb-4 opacity-50" />
                  <p>Wählen Sie einen Bericht aus der Liste</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
