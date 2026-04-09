"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  FileText,
  Mic,
  TrendingUp,
  Calendar,
} from "lucide-react";

interface Stats {
  totalUsers: number;
  totalDocuments: number;
  totalInvoices: number;
  totalQuotes: number;
  totalContacts: number;
  contactsWithEmail: number;
  contactsContacted: number;
  recentSignups: { email: string; created_at: string }[];
  recentDocuments: {
    document_number: string;
    document_type: string;
    total: number;
    created_at: string;
  }[];
  documentsByDay: { date: string; count: number }[];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      // Fetch all data in parallel
      const [
        { count: totalUsers },
        { data: documents },
        { data: contacts },
        { data: profiles },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase
          .from("documents")
          .select("document_number, document_type, total, status, created_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("contacts")
          .select("email, contacted, created_at"),
        supabase
          .from("profiles")
          .select("email, created_at")
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      const docs = documents || [];
      const cons = contacts || [];

      // Documents by day (last 14 days)
      const dayMap: Record<string, number> = {};
      docs.forEach((d) => {
        const day = d.created_at.split("T")[0];
        dayMap[day] = (dayMap[day] || 0) + 1;
      });
      const documentsByDay = Object.entries(dayMap)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-14);

      setStats({
        totalUsers: totalUsers || 0,
        totalDocuments: docs.length,
        totalInvoices: docs.filter((d) => d.document_type === "invoice").length,
        totalQuotes: docs.filter((d) => d.document_type === "quote").length,
        totalContacts: cons.length,
        contactsWithEmail: cons.filter((c) => c.email).length,
        contactsContacted: cons.filter((c) => c.contacted).length,
        recentSignups: (profiles || []).map((p) => ({
          email: p.email || "—",
          created_at: p.created_at,
        })),
        recentDocuments: docs.slice(0, 10),
        documentsByDay,
      });
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Cargando stats...
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Admin — Stats</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Usuarios",
            value: stats.totalUsers,
            icon: Users,
            color: "text-blue-600 bg-blue-100",
          },
          {
            label: "Documentos",
            value: stats.totalDocuments,
            icon: FileText,
            color: "text-indigo-600 bg-indigo-100",
          },
          {
            label: "Facturas",
            value: stats.totalInvoices,
            icon: TrendingUp,
            color: "text-green-600 bg-green-100",
          },
          {
            label: "Presupuestos",
            value: stats.totalQuotes,
            icon: Mic,
            color: "text-orange-600 bg-orange-100",
          },
        ].map((kpi) => (
          <Card key={kpi.label} className="border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center justify-center w-9 h-9 rounded-lg ${kpi.color}`}
                >
                  <kpi.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums">
                    {kpi.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Outreach stats */}
      <Card className="border shadow-sm">
        <CardContent className="p-4">
          <h2 className="text-sm font-semibold mb-3">Outreach</h2>
          <div className="flex gap-6 text-sm">
            <div>
              <span className="text-2xl font-bold tabular-nums">
                {stats.totalContacts}
              </span>
              <p className="text-xs text-muted-foreground">Contactos</p>
            </div>
            <div>
              <span className="text-2xl font-bold tabular-nums text-blue-600">
                {stats.contactsWithEmail}
              </span>
              <p className="text-xs text-muted-foreground">Con email</p>
            </div>
            <div>
              <span className="text-2xl font-bold tabular-nums text-green-600">
                {stats.contactsContacted}
              </span>
              <p className="text-xs text-muted-foreground">Contactados</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity chart (simple bar) */}
      {stats.documentsByDay.length > 0 && (
        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <h2 className="text-sm font-semibold mb-3">
              Documentos por día
            </h2>
            <div className="flex items-end gap-1 h-24">
              {stats.documentsByDay.map((d) => {
                const max = Math.max(
                  ...stats.documentsByDay.map((x) => x.count)
                );
                const height = max > 0 ? (d.count / max) * 100 : 0;
                return (
                  <div
                    key={d.date}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      {d.count}
                    </span>
                    <div
                      className="w-full bg-primary/80 rounded-t min-h-[2px]"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-[9px] text-muted-foreground">
                      {d.date.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Recent signups */}
        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <h2 className="text-sm font-semibold mb-3">Últimos registros</h2>
            {stats.recentSignups.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin registros aún</p>
            ) : (
              <div className="space-y-2">
                {stats.recentSignups.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="truncate">{s.email}</span>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">
                      {formatDate(s.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent documents */}
        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <h2 className="text-sm font-semibold mb-3">
              Últimos documentos
            </h2>
            {stats.recentDocuments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Sin documentos aún
              </p>
            ) : (
              <div className="space-y-2">
                {stats.recentDocuments.map((d, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          d.document_type === "invoice"
                            ? "bg-blue-500"
                            : "bg-orange-500"
                        }`}
                      />
                      <span className="font-mono text-xs">
                        {d.document_number}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(d.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
