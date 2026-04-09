"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Camera, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Profile } from "@/types";

const PROVINCES = [
  "A Coruña", "Álava", "Albacete", "Alicante", "Almería", "Asturias",
  "Ávila", "Badajoz", "Barcelona", "Burgos", "Cáceres", "Cádiz",
  "Cantabria", "Castellón", "Ciudad Real", "Córdoba", "Cuenca",
  "Girona", "Granada", "Guadalajara", "Gipuzkoa", "Huelva", "Huesca",
  "Illes Balears", "Jaén", "La Rioja", "Las Palmas", "León", "Lleida",
  "Lugo", "Madrid", "Málaga", "Murcia", "Navarra", "Ourense",
  "Palencia", "Pontevedra", "Salamanca", "Santa Cruz de Tenerife",
  "Segovia", "Sevilla", "Soria", "Tarragona", "Teruel", "Toledo",
  "Valencia", "Valladolid", "Vizcaya", "Zamora", "Zaragoza",
];

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    company_name: "",
    nif: "",
    address: "",
    city: "",
    postal_code: "",
    province: "",
    phone: "",
    email: "",
    bank_iban: "",
    default_iva: 21,
  });

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setIsNew(false);
        setLogoUrl(data.logo_url || null);
        setForm({
          company_name: data.company_name || "",
          nif: data.nif || "",
          address: data.address || "",
          city: data.city || "",
          postal_code: data.postal_code || "",
          province: data.province || "",
          phone: data.phone || "",
          email: data.email || "",
          bank_iban: data.bank_iban || "",
          default_iva: data.default_iva || 21,
        });
      }
      setInitialLoading(false);
    }
    loadProfile();
  }, []);

  function updateField(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten archivos de imagen");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("La imagen no puede superar 2MB");
      return;
    }

    setUploadingLogo(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Sesion expirada");
        return;
      }

      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/logo.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        toast.error("Error al subir la imagen: " + uploadError.message);
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("logos")
        .getPublicUrl(filePath);

      const newLogoUrl = urlData.publicUrl;

      // Update profile with logo URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ logo_url: newLogoUrl })
        .eq("id", user.id);

      if (updateError) {
        toast.error("Error al guardar la URL del logo: " + updateError.message);
        return;
      }

      setLogoUrl(newLogoUrl);
      toast.success("Logo actualizado");
    } catch {
      toast.error("Error inesperado al subir el logo");
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Sesión expirada. Vuelve a iniciar sesión.");
      setLoading(false);
      return;
    }

    const formWithLogo = { ...form, logo_url: logoUrl };
    const profileData = {
      id: user.id,
      ...formWithLogo,
    };

    const { error } = isNew
      ? await supabase.from("profiles").insert(profileData)
      : await supabase.from("profiles").update(formWithLogo).eq("id", user.id);

    if (error) {
      toast.error("Error al guardar: " + error.message);
      setLoading(false);
      return;
    }

    toast.success(isNew ? "¡Empresa configurada!" : "Datos actualizados");
    setIsNew(false);
    setLoading(false);

    if (isNew) {
      router.push("/dashboard");
      router.refresh();
    }
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>
            {isNew ? "Configura tu empresa" : "Datos de empresa"}
          </CardTitle>
          <CardDescription>
            {isNew
              ? "Estos datos aparecerán en tus facturas y presupuestos"
              : "Actualiza tus datos cuando lo necesites"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Logo upload */}
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingLogo}
                className="relative group h-24 w-24 rounded-full border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors flex items-center justify-center overflow-hidden bg-muted/50"
              >
                {uploadingLogo ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : logoUrl ? (
                  <>
                    <img
                      src={logoUrl}
                      alt="Logo de empresa"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="h-5 w-5 text-white" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    {form.company_name ? (
                      <span className="text-xl font-bold text-muted-foreground">
                        {form.company_name.substring(0, 2).toUpperCase()}
                      </span>
                    ) : (
                      <Camera className="h-6 w-6 text-muted-foreground/60" />
                    )}
                  </div>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground">
                Logo de empresa (aparecera en tus facturas)
              </p>
            </div>

            {/* Company info */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Nombre de empresa *</Label>
                <Input
                  id="company_name"
                  placeholder="Electricidad Pérez"
                  value={form.company_name}
                  onChange={(e) => updateField("company_name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nif">NIF/CIF *</Label>
                <Input
                  id="nif"
                  placeholder="12345678A"
                  value={form.nif}
                  onChange={(e) => updateField("nif", e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                placeholder="Calle Mayor 15, 2ºB"
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  placeholder="Madrid"
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postal_code">Código postal</Label>
                <Input
                  id="postal_code"
                  placeholder="28001"
                  value={form.postal_code}
                  onChange={(e) => updateField("postal_code", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="province">Provincia</Label>
                <Select
                  value={form.province}
                  onValueChange={(value) => updateField("province", value ?? "")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
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
            </div>

            {/* Contact */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="612 345 678"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email de contacto</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="info@tuempresa.com"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                />
              </div>
            </div>

            {/* Bank & IVA */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bank_iban">IBAN bancario</Label>
                <Input
                  id="bank_iban"
                  placeholder="ES12 3456 7890 1234 5678 9012"
                  value={form.bank_iban}
                  onChange={(e) => updateField("bank_iban", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="default_iva">IVA por defecto (%)</Label>
                <Select
                  value={String(form.default_iva)}
                  onValueChange={(value) =>
                    updateField("default_iva", parseInt(value ?? "21"))
                  }
                >
                  <SelectTrigger>
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
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? "Guardando..."
                : isNew
                  ? "Guardar y empezar"
                  : "Guardar cambios"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
