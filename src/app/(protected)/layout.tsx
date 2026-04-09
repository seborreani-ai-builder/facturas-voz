import { redirect } from "next/navigation";
import Link from "next/link";
import { Mic, LayoutGrid, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";

// Admin emails that can see the Outreach section
const ADMIN_EMAILS = [
  "seborreani@gmail.com",
  "seborabadias@gmail.com",
];

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const isAdmin = ADMIN_EMAILS.includes(user.email || "");

  // Check if profile exists
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, company_name")
    .eq("id", user.id)
    .single();

  // Redirect to profile setup if no profile (except if already on /profile)
  const hasProfile = !!profile;

  // Get initials from company name (first 2 letters) for the avatar
  const initials = profile?.company_name
    ? profile.company_name.substring(0, 2).toUpperCase()
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-muted/40">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-lg shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 group"
          >
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-sm transition-shadow group-hover:shadow-md">
              <Mic className="h-4 w-4" />
            </div>
            <span className="text-base sm:text-lg font-bold tracking-tight">
              VozFactura
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                className="gap-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors !h-9 px-3"
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="text-sm font-medium">Panel</span>
              </Button>
            </Link>
            {isAdmin && (
              <Link href="/outreach">
                <Button
                  variant="ghost"
                  className="gap-1.5 rounded-lg text-orange-500 hover:text-orange-600 hover:bg-orange-50 transition-colors !h-9 px-3"
                >
                  <span className="text-sm font-medium">Outreach</span>
                </Button>
              </Link>
            )}

            <div className="w-px h-5 bg-border mx-0.5" />

            <UserMenu
              email={user.email || ""}
              initials={initials}
            />
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        {!hasProfile ? (
          <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6">
            <div className="relative overflow-hidden rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-50 via-amber-50/80 to-orange-50 p-5 shadow-sm">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-100/40 via-transparent to-transparent" />
              <div className="relative flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-amber-900">
                    Configura los datos de tu empresa
                  </p>
                  <p className="text-sm text-amber-700/90">
                    Antes de crear facturas, necesitas completar tu perfil con
                    los datos de tu negocio.
                  </p>
                  <Link href="/profile">
                    <Button
                      size="sm"
                      className="mt-1 bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                    >
                      Configurar empresa
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : null}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">{children}</div>
      </main>
    </div>
  );
}
