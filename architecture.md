# VozFactura — Architecture

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | Next.js 14 (App Router) | SSR, API routes, easy Vercel deploy |
| Styling | Tailwind CSS + shadcn/ui | Fast UI development, consistent design |
| Database | Supabase (PostgreSQL) | Auth + DB + Storage in one, generous free tier |
| Auth | Supabase Auth (email/password) | Simple, built-in, no third-party needed |
| AI | Google Gemini Flash | Cheap, fast, handles audio natively — one model for everything |
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
