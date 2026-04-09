"use client";

import { useState, useEffect, useCallback } from "react";
import { Mic, Square, FileText, Download, Check, Send } from "lucide-react";

const DEMO_TEXT =
  "He instalado 3 enchufes en casa de María García, calle Sol 12. Le cobro 90€ de mano de obra y 35€ de material.";

const DEMO_ITEMS = [
  { description: "Instalación de enchufes", qty: 3, price: 30.0 },
  { description: "Material eléctrico", qty: 1, price: 35.0 },
];

const DEMO_CLIENT = "María García";
const DEMO_SUBTOTAL = 125.0;
const DEMO_IVA = 26.25;
const DEMO_TOTAL = 151.25;

type DemoStep = "idle" | "recording" | "extracting" | "invoice" | "sent";

export function LandingDemo() {
  const [step, setStep] = useState<DemoStep>("idle");
  const [visibleChars, setVisibleChars] = useState(0);
  const [timer, setTimer] = useState(0);
  const [showItems, setShowItems] = useState(0);

  const resetDemo = useCallback(() => {
    setStep("idle");
    setVisibleChars(0);
    setTimer(0);
    setShowItems(0);
  }, []);

  // Auto-start loop
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (step === "idle") setStep("recording");
    }, 1500);
    return () => clearTimeout(timeout);
  }, [step]);

  // Recording: timer + typewriter together
  useEffect(() => {
    if (step !== "recording") return;

    const timerInterval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);

    // Start typewriter after short delay
    let typewriterInterval: ReturnType<typeof setInterval>;
    const startDelay = setTimeout(() => {
      typewriterInterval = setInterval(() => {
        setVisibleChars((prev) => {
          if (prev >= DEMO_TEXT.length) {
            clearInterval(typewriterInterval);
            // Move to extracting (inline, same screen)
            setTimeout(() => setStep("extracting"), 600);
            return prev;
          }
          return prev + 1;
        });
      }, 45);
    }, 800);

    return () => {
      clearInterval(timerInterval);
      clearTimeout(startDelay);
      if (typewriterInterval) clearInterval(typewriterInterval);
    };
  }, [step]);

  // Extracting → invoice (short pause then show invoice)
  useEffect(() => {
    if (step !== "extracting") return;
    const timeout = setTimeout(() => setStep("invoice"), 1500);
    return () => clearTimeout(timeout);
  }, [step]);

  // Show items one by one
  useEffect(() => {
    if (step !== "invoice") return;
    const interval = setInterval(() => {
      setShowItems((prev) => {
        if (prev >= DEMO_ITEMS.length + 1) {
          // +1 for totals
          setTimeout(() => setStep("sent"), 1500);
          return prev;
        }
        return prev + 1;
      });
    }, 400);
    return () => clearInterval(interval);
  }, [step]);

  // Sent → restart
  useEffect(() => {
    if (step !== "sent") return;
    const timeout = setTimeout(resetDemo, 3000);
    return () => clearTimeout(timeout);
  }, [step, resetDemo]);

  function formatTime(s: number) {
    return `0:${s.toString().padStart(2, "0")}`;
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Phone frame */}
      <div className="relative bg-white rounded-3xl shadow-2xl shadow-gray-300/50 border border-gray-200 overflow-hidden">
        {/* Status bar */}
        <div className="flex items-center justify-between px-5 pt-3 pb-2 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <Mic className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-semibold text-gray-800">VozFactura</span>
          </div>
          <span className="text-[10px] text-gray-400">Nueva Factura</span>
        </div>

        {/* Content area */}
        <div className="p-4 min-h-[340px] flex flex-col">
          {/* Step: Idle */}
          {step === "idle" && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 animate-fade-up">
              <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Mic className="w-7 h-7 text-white" />
              </div>
              <p className="text-xs text-gray-400">Pulsa para grabar</p>
            </div>
          )}

          {/* Step: Recording + live transcription + extracting (all inline) */}
          {(step === "recording" || step === "extracting") && (
            <div className="flex-1 flex flex-col gap-3 animate-fade-up">
              {/* Mic + status */}
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  {step === "recording" && (
                    <div className="absolute inset-0 w-10 h-10 rounded-full bg-orange-400/20 animate-ping" />
                  )}
                  <div className={`relative w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-colors duration-300 ${
                    step === "recording"
                      ? "bg-orange-500 shadow-orange-500/30"
                      : "bg-blue-600 shadow-blue-500/30"
                  }`}>
                    {step === "recording" ? (
                      <Mic className="w-4 h-4 text-white" />
                    ) : (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  {step === "recording" ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium text-orange-600">
                          Grabando... {formatTime(timer)}
                        </span>
                      </div>
                      <div className="flex items-end gap-px h-4 mt-1">
                        {Array.from({ length: 30 }).map((_, i) => (
                          <div
                            key={i}
                            className="w-0.5 bg-orange-300 rounded-full"
                            style={{
                              height: `${3 + Math.sin((Date.now() / 200 + i) * 0.8) * 6 + Math.random() * 4}px`,
                            }}
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-blue-600">
                        Extrayendo datos con IA...
                      </span>
                      <div className="flex gap-0.5">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Live transcript */}
              {visibleChars > 0 && (
                <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700 leading-relaxed">
                  {DEMO_TEXT.slice(0, visibleChars)}
                  {visibleChars < DEMO_TEXT.length && (
                    <span className="inline-block w-0.5 h-4 bg-orange-500 ml-0.5 animate-pulse" />
                  )}
                </div>
              )}

              {visibleChars >= DEMO_TEXT.length && step === "recording" && (
                <div className="flex items-center gap-1.5 text-xs text-green-600 animate-fade-up">
                  <Check className="w-3.5 h-3.5" />
                  Audio procesado
                </div>
              )}
            </div>
          )}

          {/* Step: Invoice preview */}
          {step === "invoice" && (
            <div className="flex-1 flex flex-col gap-2 animate-fade-up">
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Factura</span>
                <span className="text-[10px] text-gray-400 font-mono">FAC-2026-003</span>
              </div>

              {/* Client */}
              <div className="text-xs text-gray-500">
                Cliente: <span className="text-gray-800 font-medium">{DEMO_CLIENT}</span>
              </div>

              {/* Items */}
              <div className="border rounded-lg overflow-hidden text-xs mt-1">
                <div className="grid grid-cols-12 gap-1 bg-gray-50 px-2 py-1.5 font-medium text-gray-500 text-[10px] uppercase">
                  <span className="col-span-6">Concepto</span>
                  <span className="col-span-2 text-right">Uds</span>
                  <span className="col-span-2 text-right">Precio</span>
                  <span className="col-span-2 text-right">Total</span>
                </div>
                {DEMO_ITEMS.map((item, i) => (
                  <div
                    key={i}
                    className={`grid grid-cols-12 gap-1 px-2 py-1.5 border-t transition-all duration-300 ${
                      i < showItems ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                    }`}
                  >
                    <span className="col-span-6 text-gray-700">{item.description}</span>
                    <span className="col-span-2 text-right text-gray-500">{item.qty}</span>
                    <span className="col-span-2 text-right text-gray-500">{item.price.toFixed(0)}€</span>
                    <span className="col-span-2 text-right font-medium">
                      {(item.qty * item.price).toFixed(0)}€
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div
                className={`text-xs space-y-0.5 text-right mt-1 transition-all duration-500 ${
                  showItems > DEMO_ITEMS.length ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                }`}
              >
                <div className="flex justify-end gap-4 text-gray-500">
                  <span>Subtotal:</span>
                  <span className="w-16 tabular-nums">{DEMO_SUBTOTAL.toFixed(2)}€</span>
                </div>
                <div className="flex justify-end gap-4 text-gray-500">
                  <span>IVA 21%:</span>
                  <span className="w-16 tabular-nums">{DEMO_IVA.toFixed(2)}€</span>
                </div>
                <div className="flex justify-end gap-4 font-bold text-gray-900 text-sm pt-1 border-t">
                  <span>Total:</span>
                  <span className="w-16 tabular-nums">{DEMO_TOTAL.toFixed(2)}€</span>
                </div>
              </div>
            </div>
          )}

          {/* Step: Sent */}
          {step === "sent" && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 animate-fade-up">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-900">¡Factura enviada!</p>
                <p className="text-xs text-gray-500 mt-1">PDF enviado a maria.garcia@email.com</p>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-600">
                  <Download className="w-3 h-3" /> PDF
                </div>
                <div className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 rounded-full text-xs text-blue-600">
                  <Send className="w-3 h-3" /> Email
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
