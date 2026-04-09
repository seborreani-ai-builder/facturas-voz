# VozFactura — Project Conventions

## Stack
- Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui (base-ui)
- Supabase (DB + Auth + Storage)
- Google Gemini 2.5 Flash Lite (text) + Flash (audio)
- @react-pdf/renderer (PDF), Resend (email)

## Code Style
- All code in English (variables, functions, comments)
- UI text in Spanish (with proper accents: á, é, í, ó, ú, ñ)
- Use TypeScript strict mode
- Prefer named exports
- Use `@/*` import alias for src/ paths

## File Organization
- Pages: `src/app/(auth)/` for public, `src/app/(protected)/` for authenticated
- API routes: `src/app/api/`
- Components: `src/components/` (shared)
- Lib: `src/lib/` for utilities and service clients
- Types: `src/types/`
- Migrations: `supabase/migrations/`

## Database
- Supabase with RLS enabled on all tables (profiles, documents, document_items, clients, contacts)
- Use server-side Supabase client for mutations
- Use browser client for reads
- DB helper script: `node scripts/db.js query|migrate|tables`
- Connection: pooler at aws-0-eu-west-1

## shadcn/ui v4 Gotchas
- Uses base-ui instead of radix — no `asChild`, use `render` prop instead
- `Select.onValueChange` receives `(value: string | null)` — always handle null
- `DialogTrigger` uses `render={<Button />}` not `asChild`
- `DropdownMenuItem` supports `variant="destructive"`

## Admin
- Outreach section only visible to emails in `ADMIN_EMAILS` array (layout.tsx)
- Document status flow: draft (="Pendiente") → sent → paid/accepted/rejected

## Conventions
- shadcn/ui components in `src/components/ui/`
- Sonner for toasts, Lucide React for icons
- Mobile-first responsive design, large touch targets
- PWA enabled (manifest.json + favicon.svg)

## Deploy
- See `architecture.md` for full deployment guide
- Vercel for hosting, Supabase for DB
- Subdominio: factura.ai-implementer.com
