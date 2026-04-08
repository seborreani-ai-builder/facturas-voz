# VozFactura — Brand & Design System

## Brand Identity

### Name
**VozFactura** — clear, descriptive, memorable. "Voz" (voice) + "Factura" (invoice).

### Tagline
> "Habla. Factura. Cobra."

### Tone of Voice
- Professional but warm
- Uses "tú" (informal), never "usted"
- Simple language, no jargon
- Encouraging: "¡Listo!" "¡Enviado!" "¡Factura creada!"
- Empathetic to the user's context (tired after work, wants speed)

## Color Palette

### Primary
- **Blue 600**: `#2563EB` — Trust, professionalism. Main CTA buttons, links.
- **Blue 700**: `#1D4ED8` — Hover states.
- **Blue 50**: `#EFF6FF` — Light backgrounds.

### Accent
- **Orange 500**: `#F97316` — Energy, action. Recording indicator, highlights.
- **Orange 600**: `#EA580C` — Hover states.

### Semantic
- **Green 600**: `#16A34A` — Success, paid status.
- **Red 500**: `#EF4444` — Error, rejected status.
- **Yellow 500**: `#EAB308` — Warning, pending status.

### Neutral
- **Gray 50**: `#F9FAFB` — Page background.
- **Gray 100**: `#F3F4F6` — Card backgrounds.
- **Gray 500**: `#6B7280` — Secondary text.
- **Gray 900**: `#111827` — Primary text.
- **White**: `#FFFFFF` — Card surfaces.

## Typography

### Font Stack
- **UI Text**: `Inter` — clean, highly legible, great for mobile
- **Numbers/Amounts**: `font-variant-numeric: tabular-nums` — aligned columns in tables
- **PDF Documents**: System fonts for compatibility

### Scale
- Headings: `text-2xl` (24px) for page titles, `text-xl` (20px) for sections
- Body: `text-base` (16px) — never smaller on mobile
- Small: `text-sm` (14px) — labels, metadata only
- Amounts: `text-lg` (18px) bold — always prominent

## Components & UI Patterns

### Buttons
- **Primary**: Blue 600 bg, white text, rounded-lg, py-3 px-6 (large touch target)
- **Secondary**: White bg, blue border, blue text
- **Danger**: Red 500 bg, white text
- **Ghost**: No bg, blue text

### Cards
- White bg, rounded-xl, shadow-sm, border gray-200
- Padding: p-4 on mobile, p-6 on desktop

### Status Badges
| Status | Color | Label |
|--------|-------|-------|
| draft | Gray | Borrador |
| sent | Blue | Enviado |
| accepted | Green | Aceptado |
| paid | Green (bold) | Pagado |
| rejected | Red | Rechazado |

### Audio Recorder
- Large circular button (80px) with microphone icon
- **Idle**: Blue 600 bg
- **Recording**: Orange 500 bg with pulse animation
- Timer shown below during recording
- Waveform visualization (simple bars)

### Document Preview
- Paper-like white card with subtle shadow
- Company header at top
- Client info section
- Line items table with zebra striping
- Totals section right-aligned
- Clear visual hierarchy

## Layout

### Mobile-First
- Single column layout on mobile
- Max-width container (max-w-2xl) for content pages
- Bottom-anchored actions on mobile (sticky footer)
- Navigation: simple top bar with logo + menu

### Responsive Breakpoints
- Mobile: < 640px (primary target)
- Tablet: 640-1024px
- Desktop: > 1024px

## Iconography
- **Lucide React** icons (clean, consistent, open source)
- 24px default size, 20px in compact contexts
- Stroke width 2

## Motion
- Subtle transitions: 150ms ease for hovers, 200ms for modals
- Recording pulse: `animate-pulse` on the mic button
- Skeleton loaders for AI processing states
- No heavy animations — keep it fast and professional
