"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mic, FileText, Zap, Shield } from "lucide-react";
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

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success("Cuenta creada! Configura los datos de tu empresa.");

    // Send welcome email (fire and forget)
    fetch("/api/auth/welcome", { method: "POST" }).catch(() => {});

    router.push("/profile");
    router.refresh();
  }

  async function handleGoogleSignup() {
    setGoogleLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/profile`,
      },
    });
    if (error) {
      toast.error("Error al conectar con Google");
      setGoogleLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Branded side - hidden on mobile, visible on lg+ */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 p-12 flex-col justify-between overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 -right-10 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 -left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse [animation-delay:1.5s]" />
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Mic className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">VozFactura</span>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Empieza a facturar
            <br />
            en 30 segundos.
          </h2>
          <div className="space-y-5">
            {[
              {
                icon: Zap,
                text: "Gratis para empezar, sin tarjeta",
              },
              {
                icon: Shield,
                text: "Tus datos siempre seguros y encriptados",
              },
              {
                icon: FileText,
                text: "Facturas conformes con la normativa",
              },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0">
                  <item.icon className="h-5 w-5 text-blue-200" />
                </div>
                <span className="text-blue-100 text-sm">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <p className="text-blue-100 text-sm italic leading-relaxed">
              &ldquo;Antes tardaba 20 minutos en hacer una factura. Ahora le
              hablo al móvil y en 30 segundos está lista.&rdquo;
            </p>
            <div className="flex items-center gap-3 mt-4">
              <div className="w-8 h-8 rounded-full bg-blue-400" />
              <div>
                <p className="text-white text-sm font-medium">Maria G.</p>
                <p className="text-blue-200/60 text-xs">Diseñadora freelance</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-blue-200/60 text-sm">
            &copy; {new Date().getFullYear()} VozFactura
          </p>
        </div>
      </div>

      {/* Form side */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 bg-gray-50/50">
        {/* Mobile brand header */}
        <div className="lg:hidden flex items-center gap-2.5 mb-10">
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
              Crear cuenta
            </CardTitle>
            <CardDescription className="text-gray-500">
              Empieza a crear facturas y presupuestos por voz
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8 pt-4">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-gray-700 font-medium"
                >
                  Contraseña
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
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 transition-all duration-300"
                disabled={loading}
              >
                {loading ? "Creando cuenta..." : "Crear cuenta gratis"}
              </Button>
            </form>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-400">o</span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 border-gray-200 hover:bg-gray-50 transition-colors"
              onClick={handleGoogleSignup}
              disabled={googleLoading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {googleLoading ? "Conectando..." : "Registrarse con Google"}
            </Button>
            <p className="text-center text-sm text-gray-500 mt-6">
              Ya tienes cuenta?{" "}
              <Link
                href="/login"
                className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                Inicia sesión
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
