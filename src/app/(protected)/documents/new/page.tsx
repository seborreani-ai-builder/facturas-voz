"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  PenLine,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AudioRecorder } from "@/components/audio-recorder";
import { DocumentPreview } from "@/components/document-preview";
import type { DocumentType, ExtractedInvoiceData } from "@/types";
import { Suspense } from "react";

function NewDocumentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const docType = (searchParams.get("type") as DocumentType) || "invoice";

  const [step, setStep] = useState<"input" | "processing" | "preview">("input");
  const [text, setText] = useState("");
  const [extractedData, setExtractedData] = useState<ExtractedInvoiceData | null>(null);
  const [originalText, setOriginalText] = useState("");
  const [saving, setSaving] = useState(false);

  async function processText() {
    if (!text.trim()) {
      toast.error("Escribe o graba algo primero");
      return;
    }
    setStep("processing");
    setOriginalText(text);

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error("Error en la extracción");

      const data = await res.json();
      setExtractedData(data);
      setStep("preview");
    } catch {
      toast.error("Error al procesar el texto. Inténtalo de nuevo.");
      setStep("input");
    }
  }

  async function processAudio(audioBlob: Blob) {
    setStep("processing");

    try {
      // Convert blob to base64
      const buffer = await audioBlob.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(buffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );

      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audio: base64,
          mimeType: audioBlob.type,
        }),
      });

      if (!res.ok) throw new Error("Error en la extracción");

      const data = await res.json();
      setExtractedData(data);
      setOriginalText("[Audio grabado]");
      setStep("preview");
    } catch {
      toast.error("Error al procesar el audio. Inténtalo de nuevo.");
      setStep("input");
    }
  }

  async function handleSave(data: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al guardar");
      }

      const doc = await res.json();
      toast.success(
        data.document_type === "invoice"
          ? "¡Factura creada!"
          : "¡Presupuesto creado!"
      );
      router.push(`/documents/${doc.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al guardar");
      setSaving(false);
    }
  }

  async function handleSend(data: Record<string, unknown>) {
    setSaving(true);
    try {
      // First save
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al guardar");
      }

      const doc = await res.json();

      // Then send email
      const sendRes = await fetch(`/api/documents/${doc.id}/send`, {
        method: "POST",
      });

      if (sendRes.ok) {
        toast.success("¡Documento enviado al cliente!");
      } else {
        toast.success("Documento guardado, pero no se pudo enviar el email.");
      }

      router.push(`/documents/${doc.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {docType === "invoice" ? "Nueva Factura" : "Nuevo Presupuesto"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Pulsa el micrófono y describe tu trabajo
          </p>
        </div>
      </div>

      {/* Step 1: Input */}
      {step === "input" && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Audio Section */}
          <div className="flex items-center justify-center py-8">
            <AudioRecorder onRecordingComplete={processAudio} />
          </div>

          {/* Divider */}
          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-muted/40 backdrop-blur-sm px-3 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider text-muted-foreground">
                o escribe
              </span>
            </div>
          </div>

          {/* Text Section */}
          <Card className="overflow-hidden border-0 shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/10 text-blue-600">
                  <PenLine className="h-3.5 w-3.5" />
                </div>
                <CardTitle className="text-base font-semibold">
                  Escribir detalles
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-5">
              <Textarea
                placeholder='Ej: "He arreglado la caldera en casa de Juan García, calle Mayor 5. Le cobro 120€ por la mano de obra y 45€ por las piezas."'
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                className="text-base resize-none border-border/60 bg-muted/30 focus:bg-background transition-colors placeholder:text-muted-foreground/50"
              />

              <Button
                onClick={processText}
                className="w-full mt-4 shadow-sm"
                size="lg"
                disabled={!text.trim()}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Procesar con IA
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 2: Processing */}
      {step === "processing" && (
        <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-300">
          <div className="relative mb-6">
            <div className="absolute inset-0 h-16 w-16 rounded-full bg-primary/10 animate-ping" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20">
              <Sparkles className="h-7 w-7 animate-pulse" />
            </div>
          </div>
          <p className="text-base font-medium text-foreground">
            Extrayendo datos...
          </p>
        </div>
      )}

      {/* Step 3: Preview & Edit */}
      {step === "preview" && extractedData && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="overflow-hidden border-0 shadow-md">
            <CardHeader className="border-b border-border/60 bg-muted/30">
              <CardTitle className="text-base font-semibold">
                Revisa y confirma
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <DocumentPreview
                initialData={extractedData}
                documentType={docType}
                defaultIva={21}
                onSave={handleSave}
                onSend={handleSend}
                saving={saving}
                originalText={originalText}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function NewDocumentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-sm">Cargando...</span>
        </div>
      }
    >
      <NewDocumentContent />
    </Suspense>
  );
}
