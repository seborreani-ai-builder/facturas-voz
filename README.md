# VozFactura

Facturas y presupuestos por voz para autónomos en España.

**Live:** [factura.ai-implementer.com](https://factura.ai-implementer.com)

## Qué hace

Le hablas al móvil diciendo qué has hecho y cuánto cobras. En 10 segundos tienes una factura o presupuesto profesional en PDF, listo para enviar al cliente.

## Stack

- **Next.js 16** + Tailwind CSS + shadcn/ui
- **Supabase** (PostgreSQL + Auth + Storage)
- **Google Gemini** Flash Lite (texto) + Flash (audio)
- **@react-pdf/renderer** para PDFs
- **Resend** para emails
- **Vercel** para hosting

## Features

- Registro + perfil de empresa (nombre, NIF, IBAN, logo)
- Facturas y presupuestos por voz o texto
- IA extrae conceptos, precios y datos del cliente
- Preview editable con IVA configurable
- PDF profesional con logo de empresa
- Enviar por email o compartir (WhatsApp, etc.)
- Clientes frecuentes con autocomplete fuzzy (sin tildes)
- Conversión presupuesto → factura
- Módulo de outreach (scraping Google Maps + emails)
- Panel admin con stats
- PWA instalable

## Setup local

```bash
cp .env.local.example .env.local
# Rellenar variables
npm install
npm run dev
```

## Docs

- [product.md](product.md) — Producto y business case
- [architecture.md](architecture.md) — Stack, infra, deploy, data model
- [brand.md](brand.md) — Diseño y marca
