import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateOutreachEmail } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { contactId } = await request.json();

    if (!contactId) {
      return NextResponse.json(
        { error: "contactId es obligatorio" },
        { status: 400 }
      );
    }

    // Get contact
    const { data: contact } = await supabase
      .from("contacts")
      .select("*")
      .eq("id", contactId)
      .single();

    if (!contact) {
      return NextResponse.json(
        { error: "Contacto no encontrado" },
        { status: 404 }
      );
    }

    const emailText = await generateOutreachEmail(
      contact.business_name,
      contact.category || "autónomo",
      contact.province || "España"
    );

    // Save the generated email
    await supabase
      .from("contacts")
      .update({ outreach_email_text: emailText })
      .eq("id", contactId);

    return NextResponse.json({ email: emailText });
  } catch (error) {
    console.error("Generate email error:", error);
    return NextResponse.json(
      { error: "Error generando email" },
      { status: 500 }
    );
  }
}
