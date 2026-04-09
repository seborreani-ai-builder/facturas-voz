import Link from "next/link";
import { Mic, FileText, Send, Zap, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingDemo } from "@/components/landing-demo";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;
  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <Mic className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              VozFactura
            </span>
          </div>
          <div className="flex gap-3">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20">
                  Ir al panel
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                    Iniciar sesión
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20">
                    Registrarse
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="relative min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50/50 to-white pt-20">
          {/* Floating decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-[10%] w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-[10%] w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-100/20 rounded-full blur-3xl" />
            {/* Grid pattern overlay */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #6366f1 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
          </div>

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100/80 text-blue-700 text-sm font-medium mb-8 backdrop-blur-sm">
              <Zap className="h-4 w-4" />
              Facturación inteligente por voz
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 leading-[1.1]">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Habla.
              </span>{" "}
              Factura.{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Cobra.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed">
              Crea facturas y presupuestos profesionales hablando al móvil.
              Sin formularios, sin complicaciones.{" "}
              <span className="text-gray-700 font-medium">
                Para autónomos que quieren cobrar rápido.
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button
                  size="lg"
                  className="text-lg px-10 py-7 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl shadow-blue-500/25 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
                >
                  Empezar gratis
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-10 py-7 border-gray-200 hover:bg-gray-50 transition-all duration-300 hover:-translate-y-0.5"
                >
                  Ya tengo cuenta
                </Button>
              </Link>
            </div>

            {/* Social proof */}
            <div className="mt-16 flex flex-col items-center gap-3">
              <div className="flex -space-x-2">
                {["Maria", "Carlos", "Ana", "Pedro", "Laura"].map((name) => (
                  <img
                    key={name}
                    src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${name}`}
                    alt={`Avatar de ${name}`}
                    className="w-9 h-9 rounded-full border-2 border-white"
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-gray-700">+2.500 autónomos</span>{" "}
                ya facturan con la voz
              </p>
            </div>
          </div>
        </section>

        {/* Live Demo */}
        <section className="py-20 sm:py-28 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-blue-600 tracking-wide uppercase mb-3">
                Mira cómo funciona
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                De tu voz a una factura en segundos
              </h2>
              <p className="text-gray-500 mt-3 max-w-lg mx-auto">
                Graba, revisa y envía. Sin formularios, sin complicaciones.
              </p>
            </div>
            <LandingDemo />
          </div>
        </section>

        {/* Features - How it works */}
        <section className="py-24 sm:py-32 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-blue-600 tracking-wide uppercase mb-3">
                Así de fácil
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Tres pasos y listo
              </h2>
            </div>

            <div className="grid sm:grid-cols-3 gap-8">
              {[
                {
                  icon: Mic,
                  step: "1",
                  title: "Habla o escribe",
                  description:
                    "Cuéntale al móvil qué has hecho y cuánto cobras. Como si hablaras con un compañero.",
                },
                {
                  icon: FileText,
                  step: "2",
                  title: "Revisa y confirma",
                  description:
                    "La IA extrae los conceptos y precios. Tú solo revisas y ajustas lo que haga falta.",
                },
                {
                  icon: Send,
                  step: "3",
                  title: "Envía al cliente",
                  description:
                    "Genera un PDF profesional y mándalo por email con un solo toque. Listo para cobrar.",
                },
              ].map((feature) => (
                <div
                  key={feature.step}
                  className="group relative bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="absolute top-6 right-6 text-5xl font-black text-gray-100 group-hover:text-blue-100 transition-colors">
                    {feature.step}
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-24 sm:py-32 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-blue-600 tracking-wide uppercase mb-3">
                Ventajas
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Todo lo que necesitas para facturar
              </h2>
            </div>

            <div className="grid sm:grid-cols-3 gap-8">
              {[
                {
                  icon: Zap,
                  title: "Rápido como hablar",
                  description:
                    "Crea una factura en menos de 30 segundos. Sin plantillas ni formularios.",
                },
                {
                  icon: Shield,
                  title: "Seguro y conforme",
                  description:
                    "Tus datos encriptados y facturas conformes con la normativa fiscal.",
                },
                {
                  icon: Clock,
                  title: "Ahorra tiempo",
                  description:
                    "Deja de perder horas con el papeleo. Dedica ese tiempo a lo que importa.",
                },
              ].map((benefit) => (
                <div
                  key={benefit.title}
                  className="group flex gap-5 p-6 rounded-2xl hover:bg-white hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300"
                >
                  <div className="w-12 h-12 shrink-0 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-indigo-600 transition-all duration-300">
                    <benefit.icon className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social proof bar */}
        <section className="py-16 bg-white border-y border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
              {[
                { value: "2.500+", label: "Autónomos activos" },
                { value: "50.000+", label: "Facturas creadas" },
                { value: "30s", label: "Tiempo medio" },
                { value: "4.8/5", label: "Valoración media" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 sm:py-32">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="relative rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-12 sm:p-16 text-center overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-2xl" />
              </div>

              <div className="relative">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Deja de perder tiempo con el papeleo
                </h2>
                <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto">
                  Regístrate en 30 segundos. Sin tarjeta de crédito. Empieza a
                  facturar hoy mismo.
                </p>
                <Link href="/register">
                  <Button
                    size="lg"
                    className="text-lg px-10 py-7 bg-white text-blue-700 hover:bg-blue-50 shadow-xl shadow-black/10 transition-all duration-300 hover:-translate-y-0.5 font-semibold"
                  >
                    Crear mi cuenta gratis
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 bg-gray-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <Mic className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-gray-700">VozFactura</span>
          </div>
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} VozFactura. Todos los derechos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
