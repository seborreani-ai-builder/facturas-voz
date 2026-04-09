import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { createClient } from "@/lib/supabase/server";
import { InvoicePDF } from "@/components/document-pdf";
import { sendInvoiceEmail } from "@/lib/resend";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Get document
  const { data: doc } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!doc) {
    return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 });
  }

  if (!doc.client_email) {
    return NextResponse.json(
      { error: "El cliente no tiene email" },
      { status: 400 }
    );
  }

  const { data: items } = await supabase
    .from("document_items")
    .select("*")
    .eq("document_id", id);

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json(
      { error: "Perfil no configurado" },
      { status: 400 }
    );
  }

  try {
    // Generate PDF
    const element = React.createElement(InvoicePDF, {
      document: doc,
      items: items || [],
      profile,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfBuffer = await renderToBuffer(element as any);

    // Send email
    await sendInvoiceEmail({
      to: doc.client_email,
      clientName: doc.client_name || "Cliente",
      documentType: doc.document_type,
      documentNumber: doc.document_number,
      companyName: profile.company_name,
      pdfBuffer: Buffer.from(pdfBuffer),
    });

    // Update status to sent
    await supabase
      .from("documents")
      .update({ status: "sent" })
      .eq("id", id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Send error:", error);
    return NextResponse.json(
      { error: "Error al enviar email" },
      { status: 500 }
    );
  }
}
