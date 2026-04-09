import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractInvoiceData, extractInvoiceFromAudio } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  // Check auth
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (body.audio) {
      // Audio input: base64 encoded audio
      const result = await extractInvoiceFromAudio(
        body.audio,
        body.mimeType || "audio/webm"
      );
      return NextResponse.json(result);
    }

    if (body.text) {
      // Text input
      const result = await extractInvoiceData(body.text);
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: "Se necesita audio o texto" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Extract error:", error);
    return NextResponse.json(
      { error: "Error al procesar. Inténtalo de nuevo." },
      { status: 500 }
    );
  }
}
