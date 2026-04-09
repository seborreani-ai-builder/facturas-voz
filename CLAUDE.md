# VozFactura — Project Conventions

## Stack
- Next.js 14 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui
- Supabase (DB + Auth + Storage), Google Gemini Flash, Resend

## Code Style
- All code in English (variables, functions, comments)
- UI text in Spanish
- Use TypeScript strict mode
- Prefer named exports
- Use `@/*` import alias for src/ paths

## File Organization
- Pages: `src/app/(auth)/` for public, `src/app/(protected)/` for authenticated
- API routes: `src/app/api/`
- Components: `src/components/` (shared), page-specific inline
- Lib: `src/lib/` for utilities and service clients
- Types: `src/types/`

## Database
- Supabase with RLS enabled on all tables
- Use server-side Supabase client for mutations
- Use browser client for real-time / reads only

## Conventions
- shadcn/ui components in `src/components/ui/`
- Use Sonner for toast notifications
- Use Lucide React for icons
- Mobile-first responsive design
- Large touch targets (min 44px)
