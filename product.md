# VozFactura — Product & Business Case

## Vision
Voice/chat-first invoicing for freelance tradespeople in Spain. No forms, no accounting software complexity. Speak or type what you did, get a professional PDF invoice or quote sent to your client.

## Problem
- ~3.4M autónomos in Spain, most in trades (electricians, plumbers, painters, locksmiths, etc.)
- Many use paper invoices, Excel, or nothing at all
- Existing invoicing software (Holded, Billage, Debitoor) is designed for office workers, too complex for tradespeople
- Creating an invoice after a job is friction — the tradesperson is tired, in their van, wants to get paid fast

## Target User
- **Persona**: Antonio, 42, electrician in Madrid
- Works 6-8 jobs per week, mostly house calls
- Uses his phone for everything, not comfortable with complex apps
- Currently writes invoices by hand or asks his wife to do it
- Needs to send invoices to comply with Spanish tax law (autónomo obligations)

## Core Value Proposition
> "Dile al móvil lo que has hecho y cuánto cobras. Te generamos la factura y se la mandamos al cliente."

## MVP Features
1. **User registration & company profile** — one-time setup of business data (name, NIF, address, bank IBAN)
2. **Voice input** — record what you did and how much you charge, in natural language
3. **Text input** — alternative chat-style input for the same purpose
4. **AI extraction** — Gemini processes audio/text and extracts: client info, line items, quantities, prices
5. **Invoice/Quote toggle** — same flow produces either a factura or presupuesto
6. **Preview & edit** — review extracted data, adjust line items, IVA rate, client details
7. **PDF generation** — professional, numbered, compliant with Spanish invoicing requirements
8. **Email delivery** — send PDF directly to client's email
9. **Document management** — list, filter, download, resend, mark as paid
10. **Quote→Invoice conversion** — one click to convert an accepted quote into an invoice

## Outreach Module (Growth)
- Scrape Google Maps for tradespeople by category and province
- Generate personalized outreach emails using AI
- Track contacted leads and responses

## What's NOT in MVP
- WhatsApp integration (Phase 2)
- Accounting reports or tax filing
- Multi-user / team features
- Payment gateway
- Mobile native app (PWA-first)

## Business Model (Post-Validation)
- **Freemium**: 5 invoices/month free, unlimited for €9.99/month
- Target: if 1% of 200 initial contacts convert → 2 paying users → iterate

## Success Metrics for MVP
- Can a non-technical user create and send an invoice in under 2 minutes?
- Does the AI correctly extract line items >80% of the time?
- Do tradespeople respond to outreach emails?
