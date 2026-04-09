"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Send,
  Share2,
  Pencil,
  FileText,
  CheckCircle,
  XCircle,
  Trash2,
  RefreshCw,
  Loader2,
  Receipt,
  ClipboardList,
  User,
  Hash,
  MapPin,
  Mail,
  StickyNote,
  CalendarClock,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { DocumentWithItems, DocumentItem } from "@/types";

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
  draft: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800",
  sent: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
  accepted: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800",
  paid: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800",
  rejected: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800",
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
    month: "long",
    year: "numeric",
  });
}

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [doc, setDoc] = useState<DocumentWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: document } = await supabase
        .from("documents")
        .select("*")
        .eq("id", id)
        .single();

      if (!document) {
        setLoading(false);
        return;
      }

      const { data: items } = await supabase
        .from("document_items")
        .select("*")
        .eq("document_id", id);

      setDoc({ ...document, items: items || [] });
      setLoading(false);
    }
    load();
  }, [id]);

  async function updateStatus(status: string) {
    setActionLoading(status);
    const supabase = createClient();
    const { error } = await supabase
      .from("documents")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast.error("Error al actualizar estado");
    } else {
      setDoc((prev) => (prev ? { ...prev, status: status as DocumentWithItems["status"] } : null));
      toast.success(`Estado actualizado: ${STATUS_LABELS[status]}`);
    }
    setActionLoading(null);
  }

  async function handleSend() {
    setActionLoading("send");
    try {
      const res = await fetch(`/api/documents/${id}/send`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      setDoc((prev) => (prev ? { ...prev, status: "sent" } : null));
      toast.success("Enviado al cliente!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al enviar");
    }
    setActionLoading(null);
  }

  async function handleConvert() {
    setActionLoading("convert");
    try {
      const res = await fetch(`/api/documents/${id}/convert`, {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      const newDoc = await res.json();
      toast.success(`Convertido a factura ${newDoc.document_number}!`);
      router.push(`/documents/${newDoc.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al convertir");
    }
    setActionLoading(null);
  }

  async function handleDelete() {
    if (!confirm("¿Eliminar este documento? Esta acción no se puede deshacer.")) return;
    setActionLoading("delete");
    const supabase = createClient();
    const { error } = await supabase.from("documents").delete().eq("id", id);
    if (error) {
      toast.error("Error al eliminar");
      setActionLoading(null);
      return;
    }
    toast.success("Documento eliminado");
    router.push("/dashboard");
  }

  function handleDownload() {
    window.open(`/api/documents/${id}/pdf`, "_blank");
  }

  async function handleShare() {
    if (!doc) return;
    const pdfUrl = `${window.location.origin}/api/documents/${id}/pdf`;
    const typeLabel = doc.document_type === "invoice" ? "Factura" : "Presupuesto";
    const shareText = `${typeLabel} ${doc.document_number}${doc.client_name ? ` para ${doc.client_name}` : ""} — ${formatCurrency(doc.total)}`;

    // Try native share (works great on mobile)
    if (navigator.share) {
      try {
        // Try sharing the PDF as a file
        const res = await fetch(`/api/documents/${id}/pdf`);
        const blob = await res.blob();
        const file = new File([blob], `${doc.document_number}.pdf`, { type: "application/pdf" });

        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            title: shareText,
            files: [file],
          });
          return;
        }
      } catch {
        // Fall through to URL sharing
      }

      try {
        await navigator.share({
          title: shareText,
          text: shareText,
          url: pdfUrl,
        });
        return;
      } catch {
        // User cancelled or share failed
        return;
      }
    }

    // Fallback: copy PDF link
    try {
      await navigator.clipboard.writeText(pdfUrl);
      toast.success("Enlace al PDF copiado");
    } catch {
      toast.error("No se pudo copiar el enlace");
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground">Cargando documento...</p>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 mb-4">
          <FileText className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-muted-foreground mb-4">Documento no encontrado</p>
        <Link href="/dashboard">
          <Button>Volver al panel</Button>
        </Link>
      </div>
    );
  }

  const isInvoice = doc.document_type === "invoice";
  const typeLabel = isInvoice ? "Factura" : "Presupuesto";
  const accentColor = isInvoice ? "blue" : "orange";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al panel
      </Link>

      {/* Document header */}
      <div className={`relative overflow-hidden rounded-2xl p-6 sm:p-8 ${isInvoice ? "bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" : "bg-gradient-to-br from-orange-500 via-orange-600 to-amber-700"} text-white`}>
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
        <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm">
                {isInvoice ? <Receipt className="h-5 w-5" /> : <ClipboardList className="h-5 w-5" />}
              </div>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                doc.status === "paid" ? "bg-green-400/20 text-green-100 border border-green-400/30" :
                doc.status === "rejected" ? "bg-red-400/20 text-red-100 border border-red-400/30" :
                "bg-white/15 text-white/90 border border-white/20"
              }`}>
                {STATUS_LABELS[doc.status]}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{doc.document_number}</h1>
            <p className={`text-sm mt-1 ${isInvoice ? "text-blue-200" : "text-orange-200"}`}>
              {typeLabel} &middot; {formatDate(doc.created_at)}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className={`text-xs uppercase tracking-wider font-medium ${isInvoice ? "text-blue-200" : "text-orange-200"}`}>Total</p>
            <p className="text-3xl sm:text-4xl font-bold tabular-nums">{formatCurrency(doc.total)}</p>
          </div>
        </div>
      </div>

      {/* Action toolbar */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-3 space-y-2">
          {/* Primary actions */}
          <div className="flex items-center gap-1">
            <Link href={`/documents/${id}/edit`}>
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                <Pencil className="h-4 w-4" /> Editar
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground" onClick={handleDownload}>
              <Download className="h-4 w-4" /> PDF
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground" onClick={handleShare}>
              <Share2 className="h-4 w-4" /> Compartir
            </Button>
            {doc.client_email && doc.status !== "paid" && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950"
                onClick={handleSend}
                disabled={actionLoading === "send"}
              >
                {actionLoading === "send" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {doc.status === "sent" ? "Reenviar" : "Enviar"}
              </Button>
            )}
          </div>

          {/* Status actions */}
          <div className="flex items-center gap-2 border-t border-border/60 pt-2">
            {doc.document_type === "quote" && doc.status !== "rejected" && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950"
                onClick={handleConvert}
                disabled={actionLoading === "convert"}
              >
                {actionLoading === "convert" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Convertir a factura
              </Button>
            )}

            {doc.status !== "paid" && doc.status !== "rejected" &&
              doc.document_type === "invoice" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => updateStatus("paid")}
                  disabled={actionLoading === "paid"}
                >
                  {actionLoading === "paid" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  Cobrado
                </Button>
              )}

            {doc.status === "sent" && doc.document_type === "quote" && (
              <Button
                size="sm"
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                onClick={() => updateStatus("accepted")}
                disabled={actionLoading === "accepted"}
              >
                {actionLoading === "accepted" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                Aceptado
              </Button>
            )}

            <div className="flex-1" />

            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
              onClick={handleDelete}
              disabled={actionLoading === "delete"}
            >
              {actionLoading === "delete" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Eliminar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Document content - paper style */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardContent className="p-0">
          {/* Client section */}
          <div className="p-6 sm:p-8 bg-gradient-to-b from-muted/30 to-transparent">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Datos del cliente
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-lg font-semibold text-foreground">{doc.client_name || "Sin nombre"}</p>
                {doc.client_nif && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                    <Hash className="h-3.5 w-3.5" /> {doc.client_nif}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                {doc.client_address && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0" /> {doc.client_address}
                  </p>
                )}
                {doc.client_email && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 shrink-0" /> {doc.client_email}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 sm:px-8">
            <Separator />
          </div>

          {/* Items section */}
          <div className="p-6 sm:p-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
              Conceptos
            </h3>

            {/* Desktop table */}
            <div className="hidden sm:block">
              <div className="grid grid-cols-12 gap-4 text-xs font-bold uppercase tracking-wider text-muted-foreground pb-3 border-b">
                <div className="col-span-6">Descripcion</div>
                <div className="col-span-2 text-right">Cantidad</div>
                <div className="col-span-2 text-right">Precio ud.</div>
                <div className="col-span-2 text-right">Importe</div>
              </div>
              {doc.items.map((item: DocumentItem, i: number) => (
                <div key={i} className="grid grid-cols-12 gap-4 py-3.5 border-b border-dashed last:border-0 items-center">
                  <div className="col-span-6">
                    <p className="font-medium text-foreground">{item.description}</p>
                  </div>
                  <div className="col-span-2 text-right tabular-nums text-muted-foreground">
                    {item.quantity}
                  </div>
                  <div className="col-span-2 text-right tabular-nums text-muted-foreground">
                    {formatCurrency(item.unit_price)}
                  </div>
                  <div className="col-span-2 text-right tabular-nums font-semibold text-foreground">
                    {formatCurrency(item.amount)}
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile stacked cards */}
            <div className="sm:hidden space-y-3">
              {doc.items.map((item: DocumentItem, i: number) => (
                <div key={i} className="rounded-xl bg-muted/40 p-4 space-y-2">
                  <p className="font-medium text-foreground">{item.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.quantity} x {formatCurrency(item.unit_price)}
                    </span>
                    <span className="font-bold tabular-nums text-foreground">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="px-6 sm:px-8">
            <Separator />
          </div>

          {/* Totals section */}
          <div className="p-6 sm:p-8">
            <div className="flex justify-end">
              <div className="w-full sm:w-72 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="tabular-nums font-medium">{formatCurrency(doc.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">IVA ({doc.iva_percent}%)</span>
                  <span className="tabular-nums font-medium">{formatCurrency(doc.iva_amount)}</span>
                </div>
                <Separator className="my-2" />
                <div className={`flex justify-between items-center rounded-xl p-4 -mx-2 ${isInvoice ? "bg-blue-50 dark:bg-blue-950/30" : "bg-orange-50 dark:bg-orange-950/30"}`}>
                  <span className="text-base font-bold">Total</span>
                  <span className={`text-2xl font-bold tabular-nums ${isInvoice ? "text-blue-700 dark:text-blue-300" : "text-orange-700 dark:text-orange-300"}`}>
                    {formatCurrency(doc.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {doc.notes && (
            <>
              <div className="px-6 sm:px-8">
                <Separator />
              </div>
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-3">
                  <StickyNote className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Notas
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{doc.notes}</p>
              </div>
            </>
          )}

          {/* Valid until (quotes) */}
          {doc.document_type === "quote" && doc.valid_until && (
            <>
              <div className="px-6 sm:px-8">
                <Separator />
              </div>
              <div className="p-6 sm:p-8">
                <div className="inline-flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-4 py-2.5">
                  <CalendarClock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                    Valido hasta: {formatDate(doc.valid_until)}
                  </span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
