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

    if (!body.audio && !body.text) {
      return NextResponse.json(
        { error: "Se necesita audio o texto" },
        { status: 400 }
      );
    }

    // Retry up to 2 times on failure (Gemini cold start / transient errors)
    let lastError: unknown;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        if (body.audio) {
          const result = await extractInvoiceFromAudio(
            body.audio,
            body.mimeType || "audio/webm"
          );
          return NextResponse.json(result);
        } else {
          const result = await extractInvoiceData(body.text);
          return NextResponse.json(result);
        }
      } catch (err) {
        lastError = err;
        console.error(`Extract attempt ${attempt + 1} failed:`, err);
        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        }
      }
    }

    throw lastError;
  } catch (error) {
    console.error("Extract error (all retries failed):", error);
    return NextResponse.json(
      { error: "Error al procesar. Inténtalo de nuevo." },
      { status: 500 }
    );
  }
}
