"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mic } from "lucide-react";
import { toast } from "sonner";
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

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Session was already established by /auth/callback
    // Just verify user is authenticated
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setReady(true);
      } else {
        setError(true);
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast.error("Error al cambiar la contraseña. Intenta de nuevo.");
      setLoading(false);
      return;
    }

    toast.success("Contraseña actualizada correctamente");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gray-50/50">
      <div className="flex items-center gap-2.5 mb-10">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
          <Mic className="h-5 w-5 text-white" />
        </div>
        <span className="text-2xl font-bold tracking-tight text-gray-900">
          VozFactura
        </span>
      </div>

      <Card className="w-full max-w-md border-0 shadow-xl shadow-gray-200/50 bg-white">
        <CardHeader className="text-center pb-2 pt-8">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Nueva contraseña
          </CardTitle>
          <CardDescription className="text-gray-500">
            Introduce tu nueva contraseña para recuperar el acceso
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8 pt-4">
          {error ? (
            <div className="text-center py-8 space-y-4">
              <p className="text-sm text-red-600">
                El enlace ha expirado o no es válido. Solicita uno nuevo.
              </p>
              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                Solicitar nuevo enlace
              </Link>
            </div>
          ) : !ready ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
              <p className="text-sm text-gray-500">Verificando enlace...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-gray-700 font-medium"
                >
                  Nueva contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                  className="h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-gray-700 font-medium"
                >
                  Confirmar contraseña
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repite la contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                  required
                  className="h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 transition-all duration-300"
                disabled={loading}
              >
                {loading ? "Guardando..." : "Guardar nueva contraseña"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
