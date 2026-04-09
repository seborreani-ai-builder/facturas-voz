import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if welcome email was already sent (stored in user metadata)
  if (user.user_metadata?.welcome_email_sent) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: user.email,
    subject: "Bienvenido a VozFactura 🎤",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-block;">
            <span style="font-size: 22px; font-weight: 700; color: #111827;">VozFactura</span>
          </div>
        </div>
        <div style="background: white; border-radius: 16px; padding: 32px; border: 1px solid #e5e7eb;">
          <h2 style="margin: 0 0 16px; font-size: 20px; color: #111827;">¡Bienvenido a VozFactura!</h2>
          <p style="color: #4b5563; font-size: 14px; line-height: 1.7; margin: 0 0 16px;">
            Tu cuenta está lista. Ahora puedes crear facturas y presupuestos profesionales dictándolos por voz.
          </p>
          <p style="color: #4b5563; font-size: 14px; line-height: 1.7; margin: 0 0 8px; font-weight: 600;">
            Primeros pasos:
          </p>
          <ol style="color: #4b5563; font-size: 14px; line-height: 2; margin: 0 0 24px; padding-left: 20px;">
            <li>Completa los datos de tu empresa en tu perfil</li>
            <li>Crea tu primera factura con el botón de micrófono</li>
            <li>Envíala directamente por email a tu cliente</li>
          </ol>
          <a href="https://factura.ai-implementer.com/dashboard" style="display: block; text-align: center; background: linear-gradient(to right, #2563eb, #4f46e5); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
            Ir al panel
          </a>
        </div>
        <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 24px;">
          &copy; 2026 VozFactura &middot; factura.ai-implementer.com
        </p>
      </div>
    `,
  });

  if (error) {
    return NextResponse.json(
      { error: "Failed to send welcome email" },
      { status: 500 }
    );
  }

  // Mark welcome email as sent in user metadata
  await supabase.auth.updateUser({
    data: { welcome_email_sent: true },
  });

  return NextResponse.json({ ok: true });
}
