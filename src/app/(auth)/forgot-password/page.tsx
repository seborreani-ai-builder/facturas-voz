"use client";

import { useState } from "react";
import Link from "next/link";
import { Mic, ArrowLeft } from "lucide-react";
import { resetPassword } from "./actions";
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    await resetPassword(email);

    setSent(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Branded side - hidden on mobile, visible on lg+ */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-12 flex-col justify-between overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 -right-10 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
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
            Recupera el acceso
            <br />
            a tu cuenta.
          </h2>
          <p className="text-blue-100 text-sm max-w-sm">
            Te enviaremos un enlace seguro a tu email para que puedas restablecer
            tu contraseña y volver a facturar en segundos.
          </p>
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
              Recuperar contraseña
            </CardTitle>
            <CardDescription className="text-gray-500">
              Introduce tu email y te enviaremos un enlace para restablecer tu
              contraseña
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8 pt-4">
            {sent ? (
              <div className="space-y-6">
                <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                  <p className="text-sm text-green-800">
                    Si existe una cuenta con ese email, recibirás un enlace para
                    restablecer tu contraseña.
                  </p>
                </div>
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 text-sm text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver a iniciar sesión
                </Link>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-gray-700 font-medium"
                    >
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
                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 transition-all duration-300"
                    disabled={loading}
                  >
                    {loading
                      ? "Enviando..."
                      : "Enviar enlace de recuperación"}
                  </Button>
                </form>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                </div>
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 text-sm text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver a iniciar sesión
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
