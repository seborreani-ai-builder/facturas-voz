"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Plus, Mic, Search, Receipt, ClipboardList, TrendingUp, Clock, CheckCircle2, Sparkles, ArrowUpDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Document } from "@/types";

const STATUS_LABELS: Record<string, string> = {
  draft: "Pendiente",
  sent: "Enviado",
  accepted: "Aceptado",
  paid: "Pagado",
  rejected: "Rechazado",
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "secondary",
  sent: "default",
  accepted: "default",
  paid: "default",
  rejected: "destructive",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  sent: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  accepted: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  paid: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 20) return "Buenas tardes";
  return "Buenas noches";
}

export default function DashboardPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  useEffect(() => {
    async function loadDocuments() {
      const supabase = createClient();
      const { data } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });

      setDocuments(data || []);
      setLoading(false);
    }
    loadDocuments();
  }, []);

  const filtered = documents
    .filter((d) => filter === "all" || d.document_type === filter)
    .filter((d) => statusFilter === "all" || d.status === statusFilter)
    .filter((d) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        (d.client_name?.toLowerCase().includes(q)) ||
        d.document_number.toLowerCase().includes(q) ||
        (d.notes?.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  // Stats
  const invoices = documents.filter((d) => d.document_type === "invoice");
  const totalInvoiced = invoices.reduce((sum, d) => sum + d.total, 0);
  const totalPaid = invoices
    .filter((d) => d.status === "paid")
    .reduce((sum, d) => sum + d.total, 0);
  const totalPending = invoices
    .filter((d) => d.status !== "paid" && d.status !== "rejected" && d.status !== "draft")
    .reduce((sum, d) => sum + d.total, 0);

  return (
    <div className="space-y-6">
      {/* Header row: title + actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Documentos</h1>
          {documents.length > 0 && (
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <span className="tabular-nums">{formatCurrency(totalInvoiced)} facturado</span>
              {totalPending > 0 && (
                <span className="tabular-nums text-amber-600">{formatCurrency(totalPending)} pendiente</span>
              )}
              {totalPaid > 0 && (
                <span className="tabular-nums text-green-600">{formatCurrency(totalPaid)} cobrado</span>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Link href="/documents/new?type=quote">
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Presupuesto
            </Button>
          </Link>
          <Link href="/documents/new?type=invoice">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Factura
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Search + type tabs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente, número..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="draft">Pendiente</SelectItem>
                <SelectItem value="sent">Enviado</SelectItem>
                <SelectItem value="accepted">Aceptado</SelectItem>
                <SelectItem value="paid">Pagado</SelectItem>
                <SelectItem value="rejected">Rechazado</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 text-muted-foreground"
              onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
              title={sortOrder === "desc" ? "Más recientes primero" : "Más antiguos primero"}
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">{sortOrder === "desc" ? "Recientes" : "Antiguos"}</span>
            </Button>
          </div>
        </div>

        {/* Type tabs */}
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="bg-muted/60 h-8">
            <TabsTrigger value="all" className="text-xs h-6">Todos ({documents.length})</TabsTrigger>
            <TabsTrigger value="invoice" className="text-xs h-6">Facturas ({documents.filter(d => d.document_type === "invoice").length})</TabsTrigger>
            <TabsTrigger value="quote" className="text-xs h-6">Presupuestos ({documents.filter(d => d.document_type === "quote").length})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Cargando documentos...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 sm:py-20">
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 animate-pulse" />
            <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl shadow-blue-500/20">
              <FileText className="h-10 w-10" />
            </div>
            <div className="absolute -top-1 -right-1 flex items-center justify-center w-8 h-8 rounded-full bg-amber-400 text-white shadow-lg">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            {filter === "all"
              ? "Aún no tienes documentos"
              : filter === "invoice"
                ? "Aún no tienes facturas"
                : "Aún no tienes presupuestos"}
          </h2>
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
            Crea tu primera factura o presupuesto dictándolo por voz. Es rápido y sencillo.
          </p>
          <Link href="/documents/new?type=invoice">
            <Button size="lg" className="gap-2 shadow-lg shadow-blue-600/25 px-6">
              <Mic className="h-5 w-5" />
              Crear mi primera factura
            </Button>
          </Link>
        </div>
      )}

      {/* Document list */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((doc) => {
            const isInvoice = doc.document_type === "invoice";
            return (
              <Link key={doc.id} href={`/documents/${doc.id}`}>
                <Card className={`group relative overflow-hidden border-0 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer`}>
                  {/* Colored left border */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${isInvoice ? "bg-blue-500" : "bg-orange-400"}`} />
                  <CardContent className="flex items-center justify-between py-4 pl-5">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Type icon */}
                      <div className={`hidden sm:flex items-center justify-center w-10 h-10 rounded-xl ${isInvoice ? "bg-blue-50 dark:bg-blue-900/30" : "bg-orange-50 dark:bg-orange-900/30"}`}>
                        {isInvoice ? (
                          <Receipt className={`h-5 w-5 text-blue-500`} />
                        ) : (
                          <ClipboardList className={`h-5 w-5 text-orange-500`} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-mono text-sm font-semibold text-foreground">
                            {doc.document_number}
                          </span>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[doc.status]}`}>
                            {STATUS_LABELS[doc.status]}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-foreground truncate">
                          {doc.client_name || "Sin cliente"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(doc.created_at)} &middot; {isInvoice ? "Factura" : "Presupuesto"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right ml-4 shrink-0">
                      <p className="text-lg font-bold tabular-nums text-foreground">
                        {formatCurrency(doc.total)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
