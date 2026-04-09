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
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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

const PROVINCES = [
  "Madrid", "Barcelona", "Valencia", "Sevilla", "Málaga",
  "Zaragoza", "Bilbao", "Alicante", "Murcia", "Granada",
];

export default function OutreachPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrapeCategory, setScrapeCategory] = useState("");
  const [scrapeProvince, setScrapeProvince] = useState("");
  const [scraping, setScraping] = useState(false);
  const [filterContacted, setFilterContacted] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [generatingEmail, setGeneratingEmail] = useState<string | null>(null);
  const [emailPreview, setEmailPreview] = useState<{
    contactId: string;
    text: string;
  } | null>(null);

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
    if (!scrapeCategory || !scrapeProvince) {
      toast.error("Selecciona categoría y provincia");
      return;
    }

    setScraping(true);
    try {
      const res = await fetch("/api/outreach/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: scrapeCategory,
          province: scrapeProvince,
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

      setEmailPreview({ contactId, text: data.email });
      // Update local state
      setContacts((prev) =>
        prev.map((c) =>
          c.id === contactId ? { ...c, outreach_email_text: data.email } : c
        )
      );
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

  const filtered = contacts.filter((c) => {
    if (filterContacted === "yes" && !c.contacted) return false;
    if (filterContacted === "no" && c.contacted) return false;
    if (filterCategory !== "all" && c.category !== filterCategory) return false;
    if (
      searchQuery &&
      !c.business_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Outreach</h1>

        {/* Scrape dialog */}
        <Dialog>
          <DialogTrigger render={<Button className="gap-2" />}>
            <Search className="h-4 w-4" />
            Buscar contactos
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Buscar en Google Maps</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select value={scrapeCategory} onValueChange={(v) => setScrapeCategory(v ?? "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Provincia</Label>
                <Select value={scrapeProvince} onValueChange={(v) => setScrapeProvince(v ?? "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar provincia" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVINCES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleScrape}
                disabled={scraping}
                className="w-full"
              >
                {scraping ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Buscando...
                  </>
                ) : (
                  "Buscar"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Input
          placeholder="Buscar por nombre..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-60"
        />
        <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v ?? "all")}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterContacted} onValueChange={(v) => setFilterContacted(v ?? "all")}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="no">Sin contactar</SelectItem>
            <SelectItem value="yes">Contactados</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="secondary" className="self-center">
          {filtered.length} contactos
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
            Usa el botón &quot;Buscar contactos&quot; para scrapear Google Maps
          </p>
        </div>
      )}

      {/* Contact list */}
      <div className="space-y-3">
        {filtered.map((contact) => (
          <Card key={contact.id}>
            <CardContent className="py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">
                      {contact.business_name}
                    </h3>
                    {contact.contacted && (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-700"
                      >
                        Contactado
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                    {contact.category && (
                      <span className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs">
                          {contact.category}
                        </Badge>
                      </span>
                    )}
                    {contact.province && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {contact.city ? `${contact.city}, ` : ""}
                        {contact.province}
                      </span>
                    )}
                    {contact.phone && (
                      <a
                        href={`tel:${contact.phone}`}
                        className="flex items-center gap-1 hover:text-primary"
                      >
                        <Phone className="h-3 w-3" />
                        {contact.phone}
                      </a>
                    )}
                    {contact.website && (
                      <a
                        href={contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-primary"
                      >
                        <Globe className="h-3 w-3" />
                        Web
                      </a>
                    )}
                    {contact.rating && (
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        {contact.rating}
                      </span>
                    )}
                  </div>

                  {/* Email preview */}
                  {contact.outreach_email_text && (
                    <details className="mt-2">
                      <summary className="text-sm text-primary cursor-pointer">
                        Ver email generado
                      </summary>
                      <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded whitespace-pre-wrap">
                        {contact.outreach_email_text}
                      </p>
                    </details>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerateEmail(contact.id)}
                    disabled={generatingEmail === contact.id}
                    title="Generar email"
                  >
                    {generatingEmail === contact.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4" />
                    )}
                  </Button>
                  {!contact.contacted && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markContacted(contact.id)}
                      title="Marcar contactado"
                    >
                      <Check className="h-4 w-4" />
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
