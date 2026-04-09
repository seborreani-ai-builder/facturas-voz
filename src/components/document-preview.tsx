"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Trash2, UserCheck, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { normalize, findClientMatch } from "@/lib/utils";
import type { Client } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { DocumentType, ExtractedInvoiceData } from "@/types";

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
}

interface DocumentPreviewProps {
  initialData: ExtractedInvoiceData;
  documentType: DocumentType;
  defaultIva: number;
  onSave: (data: {
    document_type: DocumentType;
    client_name: string | null;
    client_email: string | null;
    client_nif: string | null;
    client_address: string | null;
    items: LineItem[];
    iva_percent: number;
    notes: string | null;
    valid_until: string | null;
    original_text: string | null;
    status: string;
  }) => void;
  onSend: (data: {
    document_type: DocumentType;
    client_name: string | null;
    client_email: string | null;
    client_nif: string | null;
    client_address: string | null;
    items: LineItem[];
    iva_percent: number;
    notes: string | null;
    valid_until: string | null;
    original_text: string | null;
    status: string;
  }) => void;
  saving?: boolean;
  originalText?: string;
  initialValidUntil?: string;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function DocumentPreview({
  initialData,
  documentType: initialType,
  defaultIva,
  onSave,
  onSend,
  saving,
  originalText,
  initialValidUntil,
}: DocumentPreviewProps) {
  const [docType, setDocType] = useState<DocumentType>(initialType);
  const [clientName, setClientName] = useState(initialData.client_name || "");
  const [clientEmail, setClientEmail] = useState(initialData.client_email || "");
  const [clientNif, setClientNif] = useState(initialData.client_nif || "");
  const [clientAddress, setClientAddress] = useState(
    initialData.client_address || ""
  );
  const [items, setItems] = useState<LineItem[]>(
    initialData.items.length > 0
      ? initialData.items
      : [{ description: "", quantity: 1, unit_price: 0 }]
  );
  const [ivaPercent, setIvaPercent] = useState(defaultIva);
  const [notes, setNotes] = useState(initialData.notes || "");
  const [validUntil, setValidUntil] = useState(initialValidUntil || "");
  const [clients, setClients] = useState<Client[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [matchedClient, setMatchedClient] = useState<Client | null>(null);
  const [matchDismissed, setMatchDismissed] = useState(false);
  const nameInputRef = useRef<HTMLDivElement>(null);

  // Load saved clients
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("clients")
      .select("*")
      .order("name")
      .then(({ data }) => {
        if (data) {
          setClients(data);
          // Auto-match if we have an initial client name (from AI extraction)
          if (clientName && data.length > 0) {
            const match = findClientMatch(clientName, data);
            if (match) {
              setMatchedClient(match);
            }
          }
        }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyClientMatch(client: Client) {
    setClientName(client.name);
    setClientEmail(client.email || clientEmail || "");
    setClientNif(client.nif || clientNif || "");
    setClientAddress(client.address || clientAddress || "");
    setMatchedClient(null);
    setMatchDismissed(true);
  }

  function dismissMatch() {
    setMatchedClient(null);
    setMatchDismissed(true);
  }

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );
  const ivaAmount = subtotal * (ivaPercent / 100);
  const total = subtotal + ivaAmount;

  function updateItem(index: number, field: keyof LineItem, value: string | number) {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      { description: "", quantity: 1, unit_price: 0 },
    ]);
  }

  function removeItem(index: number) {
    if (items.length > 1) {
      setItems((prev) => prev.filter((_, i) => i !== index));
    }
  }

  function buildData(status: string) {
    return {
      document_type: docType,
      client_name: clientName || null,
      client_email: clientEmail || null,
      client_nif: clientNif || null,
      client_address: clientAddress || null,
      items,
      iva_percent: ivaPercent,
      notes: notes || null,
      valid_until: validUntil || null,
      original_text: originalText || null,
      status,
    };
  }

  return (
    <div className="space-y-6">
      {/* Document type toggle */}
      <div className="flex gap-2">
        <Button
          variant={docType === "invoice" ? "default" : "outline"}
          onClick={() => setDocType("invoice")}
          className="flex-1"
        >
          Factura
        </Button>
        <Button
          variant={docType === "quote" ? "default" : "outline"}
          onClick={() => setDocType("quote")}
          className="flex-1"
        >
          Presupuesto
        </Button>
      </div>

      {/* Client info */}
      <div className="space-y-4">
        {/* Match banner — shown when AI extracted a name that matches a saved client */}
        {matchedClient && !matchDismissed && (
          <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <UserCheck className="h-5 w-5 text-blue-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-900">
                Cliente encontrado: {matchedClient.name}
              </p>
              {matchedClient.email && (
                <p className="text-xs text-blue-600 truncate">{matchedClient.email}</p>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                size="sm"
                className="!h-8 text-xs"
                onClick={() => applyClientMatch(matchedClient)}
              >
                Usar datos
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="!h-8 text-xs"
                onClick={dismissMatch}
              >
                Nuevo
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Datos del cliente</h3>
          {clients.length > 0 && (
            <select
              className="text-sm text-primary bg-transparent border-none cursor-pointer outline-none font-medium"
              value=""
              onChange={(e) => {
                const client = clients.find((c) => c.id === e.target.value);
                if (client) applyClientMatch(client);
              }}
            >
              <option value="" disabled>Cliente guardado...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1 relative" ref={nameInputRef}>
            <Label htmlFor="client_name" className="text-sm">
              Nombre
            </Label>
            <Input
              id="client_name"
              placeholder="Nombre del cliente"
              value={clientName}
              autoComplete="off"
              onChange={(e) => {
                setClientName(e.target.value);
                setShowSuggestions(e.target.value.length > 0 && clients.length > 0);
                // Check for match as user types
                if (!matchDismissed && e.target.value.length > 2) {
                  const match = findClientMatch(e.target.value, clients);
                  setMatchedClient(match ?? null);
                } else {
                  setMatchedClient(null);
                }
              }}
              onFocus={() => {
                if (clients.length > 0) setShowSuggestions(true);
              }}
              onBlur={() => {
                setTimeout(() => setShowSuggestions(false), 200);
              }}
            />
            {showSuggestions && (() => {
              const q = normalize(clientName);
              const filtered = clients.filter((c) =>
                normalize(c.name).includes(q) || q.includes(normalize(c.name))
              );
              if (filtered.length === 0) return null;
              return (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {filtered.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className="w-full text-left px-3 py-2.5 text-sm hover:bg-accent transition-colors"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applyClientMatch(c);
                        setShowSuggestions(false);
                      }}
                    >
                      <span className="font-medium">{c.name}</span>
                      {c.email && (
                        <span className="text-xs text-muted-foreground ml-2">{c.email}</span>
                      )}
                    </button>
                  ))}
                </div>
              );
            })()}
          </div>
          <div className="space-y-1">
            <Label htmlFor="client_email" className="text-sm">
              Email
            </Label>
            <Input
              id="client_email"
              type="email"
              placeholder="cliente@email.com"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="client_nif" className="text-sm">
              NIF/CIF
            </Label>
            <Input
              id="client_nif"
              placeholder="12345678A"
              value={clientNif}
              onChange={(e) => setClientNif(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="client_address" className="text-sm">
              Dirección
            </Label>
            <Input
              id="client_address"
              placeholder="Dirección del cliente"
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Line items */}
      <div className="space-y-4">
        <h3 className="font-semibold">Conceptos</h3>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-2 items-end"
            >
              <div className="col-span-12 sm:col-span-5 space-y-1">
                {index === 0 && (
                  <Label className="text-xs text-gray-500">Descripción</Label>
                )}
                <Input
                  placeholder="Descripción del trabajo"
                  value={item.description}
                  onChange={(e) =>
                    updateItem(index, "description", e.target.value)
                  }
                />
              </div>
              <div className="col-span-3 sm:col-span-2 space-y-1">
                {index === 0 && (
                  <Label className="text-xs text-gray-500">Cantidad</Label>
                )}
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(index, "quantity", parseFloat(e.target.value) || 0)
                  }
                />
              </div>
              <div className="col-span-4 sm:col-span-2 space-y-1">
                {index === 0 && (
                  <Label className="text-xs text-gray-500">Precio ud.</Label>
                )}
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unit_price}
                  onChange={(e) =>
                    updateItem(
                      index,
                      "unit_price",
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
              </div>
              <div className="col-span-3 sm:col-span-2 text-right font-medium tabular-nums pt-1">
                {formatCurrency(item.quantity * item.unit_price)}
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={addItem} className="gap-1">
          <Plus className="h-4 w-4" /> Añadir línea
        </Button>
      </div>

      <Separator />

      {/* Totals & IVA */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-3">
          <Label className="text-sm">IVA:</Label>
          <Select
            value={String(ivaPercent)}
            onValueChange={(v) => setIvaPercent(parseInt(v ?? "21"))}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="21">21% (General)</SelectItem>
              <SelectItem value="10">10% (Reducido)</SelectItem>
              <SelectItem value="4">4% (Superreducido)</SelectItem>
              <SelectItem value="0">0% (Exento)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-right space-y-1">
          <div className="flex justify-between sm:justify-end gap-8">
            <span className="text-gray-500">Subtotal:</span>
            <span className="font-medium tabular-nums">
              {formatCurrency(subtotal)}
            </span>
          </div>
          <div className="flex justify-between sm:justify-end gap-8">
            <span className="text-gray-500">IVA ({ivaPercent}%):</span>
            <span className="font-medium tabular-nums">
              {formatCurrency(ivaAmount)}
            </span>
          </div>
          <div className="flex justify-between sm:justify-end gap-8 text-lg">
            <span className="font-semibold">Total:</span>
            <span className="font-bold tabular-nums">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </div>

      {/* Quote validity */}
      {docType === "quote" && (
        <div className="space-y-1">
          <Label htmlFor="valid_until" className="text-sm">
            Válido hasta
          </Label>
          <Input
            id="valid_until"
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
          />
        </div>
      )}

      {/* Notes */}
      <div className="space-y-1">
        <Label htmlFor="notes" className="text-sm">
          Notas (opcional)
        </Label>
        <Textarea
          id="notes"
          placeholder="Condiciones, observaciones..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 pb-2">
        <Button
          variant="outline"
          className="flex-1 !h-12 text-base font-medium py-3 px-6"
          onClick={() => onSave(buildData("draft"))}
          disabled={saving}
        >
          {saving ? "Guardando..." : "Guardar"}
        </Button>
        <Button
          className="flex-1 !h-12 text-base font-medium py-3 px-6"
          onClick={() => {
            if (!clientEmail) {
              onSave(buildData("draft"));
            } else {
              onSend(buildData("sent"));
            }
          }}
          disabled={saving}
        >
          {clientEmail ? "Guardar y enviar" : "Guardar"}
        </Button>
      </div>
    </div>
  );
}
