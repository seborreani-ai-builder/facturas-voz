"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentPreview } from "@/components/document-preview";
import type { DocumentWithItems, ExtractedInvoiceData } from "@/types";

export default function EditDocumentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [doc, setDoc] = useState<DocumentWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  async function handleSave(data: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al guardar");
      }

      toast.success("Documento actualizado");
      router.push(`/documents/${id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al guardar");
      setSaving(false);
    }
  }

  async function handleSend(data: Record<string, unknown>) {
    setSaving(true);
    try {
      // First save
      const res = await fetch(`/api/documents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al guardar");
      }

      // Then send
      const sendRes = await fetch(`/api/documents/${id}/send`, {
        method: "POST",
      });

      if (sendRes.ok) {
        toast.success("¡Actualizado y enviado al cliente!");
      } else {
        toast.success("Actualizado, pero no se pudo enviar el email.");
      }

      router.push(`/documents/${id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Documento no encontrado</p>
        <Link href="/dashboard">
          <Button className="mt-4">Volver al dashboard</Button>
        </Link>
      </div>
    );
  }

  // Convert existing doc to ExtractedInvoiceData format for the preview
  const initialData: ExtractedInvoiceData = {
    client_name: doc.client_name,
    client_email: doc.client_email,
    client_nif: doc.client_nif,
    client_address: doc.client_address,
    items: doc.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
    })),
    notes: doc.notes,
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/documents/${id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">
          Editar {doc.document_number}
        </h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <DocumentPreview
            initialData={initialData}
            documentType={doc.document_type}
            defaultIva={doc.iva_percent}
            onSave={handleSave}
            onSend={handleSend}
            saving={saving}
            originalText={doc.original_text || undefined}
            initialValidUntil={doc.valid_until?.split("T")[0] || undefined}
          />
        </CardContent>
      </Card>
    </div>
  );
}
