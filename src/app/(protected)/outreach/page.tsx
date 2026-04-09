"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Download,
  Mail,
  Check,
  Loader2,
  Phone,
  Globe,
  Star,
  MapPin,
  AtSign,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Contact } from "@/types";

const CATEGORIES = [
  "Electricistas",
  "Fontaneros",
  "Pintores",
  "Cerrajeros",
  "Carpinteros",
  "Albañiles",
  "Cristaleros",
  "Jardineros",
  "Limpieza",
  "Reformas",
];

export default function OutreachPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrapeCategory, setScrapeCategory] = useState("");
  const [scrapeCity, setScrapeCity] = useState("");
  const [scrapeProvince, setScrapeProvince] = useState("");
  const [scrapePages, setScrapePages] = useState("1");
  const [scraping, setScraping] = useState(false);
  const [filterContacted, setFilterContacted] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterEmail, setFilterEmail] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [generatingEmail, setGeneratingEmail] = useState<string | null>(null);

  useEffect(() => {
    loadContacts();
  }, []);

  async function loadContacts() {
    const supabase = createClient();
    const { data } = await supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false });
    setContacts(data || []);
    setLoading(false);
  }

  async function handleScrape() {
    if (!scrapeCategory || !scrapeCity) {
      toast.error("Selecciona categoría y ciudad");
      return;
    }

    setScraping(true);
    try {
      const res = await fetch("/api/outreach/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: scrapeCategory,
          city: scrapeCity,
          province: scrapeProvince || null,
          maxPages: parseInt(scrapePages),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(data.message);
      loadContacts();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error en el scraping");
    }
    setScraping(false);
  }

  async function handleGenerateEmail(contactId: string) {
    setGeneratingEmail(contactId);
    try {
      const res = await fetch("/api/outreach/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setContacts((prev) =>
        prev.map((c) =>
          c.id === contactId ? { ...c, outreach_email_text: data.email } : c
        )
      );
      toast.success("Email generado");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error generando email");
    }
    setGeneratingEmail(null);
  }

  async function markContacted(contactId: string) {
    const supabase = createClient();
    await supabase
      .from("contacts")
      .update({ contacted: true, contacted_at: new Date().toISOString() })
      .eq("id", contactId);

    setContacts((prev) =>
      prev.map((c) =>
        c.id === contactId
          ? { ...c, contacted: true, contacted_at: new Date().toISOString() }
          : c
      )
    );
    toast.success("Marcado como contactado");
  }

  function downloadCSV() {
    const rows = filtered.map((c) => ({
      Nombre: c.business_name,
      Categoría: c.category || "",
      Ciudad: c.city || "",
      Provincia: c.province || "",
      Teléfono: c.phone || "",
      Email: c.email || "",
      Web: c.website || "",
      Rating: c.rating?.toString() || "",
      "Google Maps": c.google_maps_url || "",
      Contactado: c.contacted ? "Sí" : "No",
    }));

    const headers = Object.keys(rows[0] || {});
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        headers
          .map((h) => `"${(r[h as keyof typeof r] || "").replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `outreach-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = contacts.filter((c) => {
    if (filterContacted === "yes" && !c.contacted) return false;
    if (filterContacted === "no" && c.contacted) return false;
    if (filterCategory !== "all" && c.category !== filterCategory) return false;
    if (filterEmail === "with" && !c.email) return false;
    if (filterEmail === "without" && c.email) return false;
    if (
      searchQuery &&
      !c.business_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const stats = {
    total: contacts.length,
    withEmail: contacts.filter((c) => c.email).length,
    contacted: contacts.filter((c) => c.contacted).length,
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold">Outreach</h1>
          {contacts.length > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {stats.total} contactos · {stats.withEmail} con email · {stats.contacted} contactados
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {filtered.length > 0 && (
            <Button variant="outline" size="sm" className="gap-2" onClick={downloadCSV}>
              <Download className="h-4 w-4" /> CSV
            </Button>
          )}
          <Dialog>
            <DialogTrigger render={<Button size="sm" className="gap-2" />}>
              <Search className="h-4 w-4" />
              Buscar contactos
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Buscar en Google Maps</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Categoría *</Label>
                  <select
                    value={scrapeCategory}
                    onChange={(e) => setScrapeCategory(e.target.value)}
                    className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Seleccionar...</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Ciudad *</Label>
                  <Input
                    placeholder="Ej: Getafe, Alcorcón, Leganés..."
                    value={scrapeCity}
                    onChange={(e) => setScrapeCity(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Provincia (opcional)</Label>
                  <Input
                    placeholder="Ej: Madrid, Barcelona..."
                    value={scrapeProvince}
                    onChange={(e) => setScrapeProvince(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Volumen</Label>
                  <select
                    value={scrapePages}
                    onChange={(e) => setScrapePages(e.target.value)}
                    className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="1">~20 resultados</option>
                    <option value="2">~40 resultados</option>
                    <option value="3">~60 resultados (máximo)</option>
                  </select>
                  <p className="text-xs text-muted-foreground">
                    Los duplicados se omiten automáticamente
                  </p>
                </div>
                <Button
                  onClick={handleScrape}
                  disabled={scraping || !scrapeCategory || !scrapeCity}
                  className="w-full"
                >
                  {scraping ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Buscando (puede tardar)...
                    </>
                  ) : (
                    "Buscar"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Input
          placeholder="Buscar por nombre..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-48 h-9"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="h-9 rounded-lg border border-border bg-background px-3 text-sm"
        >
          <option value="all">Categoría</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={filterContacted}
          onChange={(e) => setFilterContacted(e.target.value)}
          className="h-9 rounded-lg border border-border bg-background px-3 text-sm"
        >
          <option value="all">Estado</option>
          <option value="no">Sin contactar</option>
          <option value="yes">Contactados</option>
        </select>
        <select
          value={filterEmail}
          onChange={(e) => setFilterEmail(e.target.value)}
          className="h-9 rounded-lg border border-border bg-background px-3 text-sm"
        >
          <option value="all">Email</option>
          <option value="with">Con email</option>
          <option value="without">Sin email</option>
        </select>
        <Badge variant="secondary" className="self-center">
          {filtered.length} resultados
        </Badge>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-20 text-gray-500">Cargando...</div>
      )}

      {/* Empty state */}
      {!loading && contacts.length === 0 && (
        <div className="text-center py-20">
          <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            Sin contactos aún
          </h2>
          <p className="text-gray-500">
            Usa &quot;Buscar contactos&quot; para scrapear Google Maps
          </p>
        </div>
      )}

      {/* Contact list */}
      <div className="space-y-2">
        {filtered.map((contact) => (
          <Card key={contact.id} className="border shadow-sm">
            <CardContent className="py-3 px-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-sm truncate">
                      {contact.business_name}
                    </h3>
                    {contact.contacted && (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-700 text-[10px]"
                      >
                        Contactado
                      </Badge>
                    )}
                    {contact.email && (
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-700 text-[10px]"
                      >
                        Email
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    {contact.category && (
                      <span>{contact.category}</span>
                    )}
                    {(contact.city || contact.province) && (
                      <span className="flex items-center gap-0.5">
                        <MapPin className="h-3 w-3" />
                        {[contact.city, contact.province].filter(Boolean).join(", ")}
                      </span>
                    )}
                    {contact.phone && (
                      <a href={`tel:${contact.phone}`} className="flex items-center gap-0.5 hover:text-primary">
                        <Phone className="h-3 w-3" />
                        {contact.phone}
                      </a>
                    )}
                    {contact.email && (
                      <a href={`mailto:${contact.email}`} className="flex items-center gap-0.5 hover:text-primary">
                        <AtSign className="h-3 w-3" />
                        {contact.email}
                      </a>
                    )}
                    {contact.website && (
                      <a href={contact.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-0.5 hover:text-primary">
                        <Globe className="h-3 w-3" />
                        Web
                      </a>
                    )}
                    {contact.rating && (
                      <span className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 text-yellow-500" />
                        {contact.rating}
                      </span>
                    )}
                  </div>

                  {/* Email preview */}
                  {contact.outreach_email_text && (
                    <details className="mt-2">
                      <summary className="text-xs text-primary cursor-pointer">
                        Ver email generado
                      </summary>
                      <p className="mt-1 text-xs text-gray-600 bg-gray-50 p-2 rounded whitespace-pre-wrap">
                        {contact.outreach_email_text}
                      </p>
                    </details>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="!h-8 !w-8 p-0"
                    onClick={() => handleGenerateEmail(contact.id)}
                    disabled={generatingEmail === contact.id}
                    title="Generar email"
                  >
                    {generatingEmail === contact.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Mail className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  {!contact.contacted && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="!h-8 !w-8 p-0"
                      onClick={() => markContacted(contact.id)}
                      title="Marcar contactado"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
