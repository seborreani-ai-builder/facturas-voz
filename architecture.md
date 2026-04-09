# VozFactura — Architecture

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | Next.js 14 (App Router) | SSR, API routes, easy Vercel deploy |
| Styling | Tailwind CSS + shadcn/ui | Fast UI development, consistent design |
| Database | Supabase (PostgreSQL) | Auth + DB + Storage in one, generous free tier |
| Auth | Supabase Auth (email/password) | Simple, built-in, no third-party needed |
| AI (text) | Google Gemini 2.5 Flash Lite | $0.025/1M tokens, extraction + outreach emails |
| AI (audio) | Google Gemini 2.5 Flash | Audio nativo, extraction directa de voz |
| PDF | @react-pdf/renderer | React-based PDF generation, good for invoices |
| Email | Resend | Simple API, good deliverability, free tier |
| Hosting | Vercel | Zero-config Next.js hosting, free tier |
| Storage | Supabase Storage | Logo uploads, generated PDFs |

## Infrastructure

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Browser    │────▶│  Vercel      │────▶│  Supabase   │
│   (Next.js)  │◀────│  (API Routes)│◀────│  (Postgres) │
└─────────────┘     └──────┬───────┘     └─────────────┘
                           │
                    ┌──────┴───────┐
                    │              │
              ┌─────▼─────┐ ┌─────▼─────┐
              │  Gemini   │ │  Resend   │
              │  (AI)     │ │  (Email)  │
              └───────────┘ └───────────┘
```

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/extract` | POST | Send audio (base64) or text to Gemini, get structured invoice JSON |
| `/api/documents` | GET/POST | List or create documents |
| `/api/documents/[id]` | GET/PATCH | Get or update a document |
| `/api/documents/[id]/pdf` | GET | Generate and return PDF |
| `/api/documents/[id]/send` | POST | Send PDF via email to client |
| `/api/documents/[id]/convert` | POST | Convert quote to invoice |
| `/api/outreach/scrape` | POST | Scrape Google Maps for contacts |
| `/api/outreach/generate-email` | POST | Generate outreach email with Gemini |

## Data Model

### profiles
```sql
id              UUID PRIMARY KEY (FK → auth.users)
company_name    TEXT NOT NULL
nif             TEXT NOT NULL
address         TEXT
city            TEXT
postal_code     TEXT
province        TEXT
phone           TEXT
email           TEXT
bank_iban       TEXT
logo_url        TEXT
default_iva     INTEGER DEFAULT 21
created_at      TIMESTAMPTZ DEFAULT now()
updated_at      TIMESTAMPTZ DEFAULT now()
```

### documents
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id         UUID NOT NULL (FK → auth.users)
document_type   TEXT CHECK (document_type IN ('invoice', 'quote'))
document_number TEXT NOT NULL
client_name     TEXT
client_email    TEXT
client_nif      TEXT
client_address  TEXT
subtotal        DECIMAL(10,2) DEFAULT 0
iva_percent     INTEGER DEFAULT 21
iva_amount      DECIMAL(10,2) DEFAULT 0
total           DECIMAL(10,2) DEFAULT 0
status          TEXT DEFAULT 'draft'
valid_until     DATE
notes           TEXT
original_text   TEXT
created_at      TIMESTAMPTZ DEFAULT now()
updated_at      TIMESTAMPTZ DEFAULT now()
```

### document_items
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
document_id     UUID NOT NULL (FK → documents)
description     TEXT NOT NULL
quantity         DECIMAL(10,2) DEFAULT 1
unit_price      DECIMAL(10,2) DEFAULT 0
amount          DECIMAL(10,2) DEFAULT 0
```

### clients
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id         UUID NOT NULL (FK → auth.users)
name            TEXT NOT NULL
email           TEXT
nif             TEXT
address         TEXT
created_at      TIMESTAMPTZ DEFAULT now()
updated_at      TIMESTAMPTZ DEFAULT now()
-- UNIQUE(user_id, name)
```

### contacts
```sql
id                  UUID PRIMARY KEY DEFAULT gen_random_uuid()
business_name       TEXT NOT NULL
category            TEXT
province            TEXT
city                TEXT
phone               TEXT
email               TEXT
website             TEXT
google_maps_url     TEXT
rating              DECIMAL(2,1)
source              TEXT DEFAULT 'google_maps'
contacted           BOOLEAN DEFAULT false
contacted_at        TIMESTAMPTZ
outreach_email_text TEXT
notes               TEXT
created_at          TIMESTAMPTZ DEFAULT now()
```

## AI Flow

### Invoice/Quote Extraction
```
User audio/text
       │
       ▼
   Gemini Flash
   (with structured prompt)
       │
       ▼
   JSON Response:
   {
     client_name, client_email, client_nif,
     items: [{ description, quantity, unit_price }],
     notes
   }
       │
       ▼
   Preview/Edit UI
       │
       ▼
   Save to Supabase
```

### Outreach Email Generation
```
Contact data (name, category, province)
       │
       ▼
   Gemini Flash
   (personalized email prompt)
       │
       ▼
   Email text in Spanish
```

## Security
- All API routes check Supabase auth session
- Row Level Security (RLS) on all tables — users can only access their own data
- API keys stored in environment variables, never exposed to client
- Audio processed server-side only

## Deployment

### Prerequisites
- Node.js 18+
- Cuentas en: Supabase, Google AI Studio, Resend, Vercel

### 1. Supabase Setup
1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ir a **SQL Editor** y ejecutar:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_clients.sql`
3. Ir a **Authentication > Providers > Email** → desactivar "Confirm email" (para MVP)
4. Copiar URL y keys de **Settings > API**

### 2. API Keys
| Variable | Dónde obtenerla |
|----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase > Settings > API (publishable) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase > Settings > API (secret) |
| `GOOGLE_GEMINI_API_KEY` | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| `GOOGLE_MAPS_API_KEY` | Google Cloud Console > Places API |
| `RESEND_API_KEY` | [resend.com](https://resend.com) |
| `RESEND_FROM_EMAIL` | Dominio verificado en Resend |

### 3. Local Development
```bash
cp .env.local.example .env.local
# Rellenar las variables en .env.local
npm install
npm run dev
```

### 4. Deploy a Vercel
1. Importar repo en [vercel.com](https://vercel.com)
2. Añadir todas las variables de entorno del `.env.local`
3. Deploy automático con cada push a `master`

Para subdominio personalizado (ej: `factura.ai-implementer.com`):
1. En Vercel > proyecto > Settings > Domains → añadir `factura.ai-implementer.com`
2. En el DNS del dominio → añadir CNAME: `factura` → `cname.vercel-dns.com`

### 5. Post-Deploy Checklist
- [ ] Verificar registro + login funciona
- [ ] Crear perfil de empresa
- [ ] Crear factura por texto → ver PDF
- [ ] Crear presupuesto por voz → ver PDF
- [ ] Enviar factura por email (requiere dominio verificado en Resend)
- [ ] Probar en móvil (PWA installable)
- [ ] Restringir API keys de Google (IP del servidor Vercel)

### Database Operations
```bash
# Consultar datos
node scripts/db.js query "SELECT * FROM documents"

# Ejecutar nueva migración
node scripts/db.js migrate supabase/migrations/003_xxx.sql

# Listar tablas
node scripts/db.js tables
```
