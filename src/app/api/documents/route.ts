import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("documents")
    .select("*, document_items(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { items, ...documentData } = body;

    // Generate document number
    const { data: numberData, error: numberError } = await supabase.rpc(
      "generate_document_number",
      {
        p_user_id: user.id,
        p_document_type: documentData.document_type,
      }
    );

    if (numberError) {
      return NextResponse.json(
        { error: "Error generando número: " + numberError.message },
        { status: 500 }
      );
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: { quantity: number; unit_price: number }) =>
        sum + item.quantity * item.unit_price,
      0
    );
    const ivaPercent = documentData.iva_percent ?? 21;
    const ivaAmount = subtotal * (ivaPercent / 100);
    const total = subtotal + ivaAmount;

    // Insert document
    const { data: doc, error: docError } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        document_type: documentData.document_type,
        document_number: numberData,
        client_name: documentData.client_name,
        client_email: documentData.client_email,
        client_nif: documentData.client_nif,
        client_address: documentData.client_address,
        subtotal: Math.round(subtotal * 100) / 100,
        iva_percent: ivaPercent,
        iva_amount: Math.round(ivaAmount * 100) / 100,
        total: Math.round(total * 100) / 100,
        status: documentData.status || "draft",
        valid_until: documentData.valid_until,
        notes: documentData.notes,
        original_text: documentData.original_text,
      })
      .select()
      .single();

    if (docError) {
      return NextResponse.json(
        { error: "Error creando documento: " + docError.message },
        { status: 500 }
      );
    }

    // Insert items
    if (items && items.length > 0) {
      const itemsWithDocId = items.map(
        (item: { description: string; quantity: number; unit_price: number }) => ({
          document_id: doc.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          amount: Math.round(item.quantity * item.unit_price * 100) / 100,
        })
      );

      const { error: itemsError } = await supabase
        .from("document_items")
        .insert(itemsWithDocId);

      if (itemsError) {
        // Cleanup: delete the document if items fail
        await supabase.from("documents").delete().eq("id", doc.id);
        return NextResponse.json(
          { error: "Error creando líneas: " + itemsError.message },
          { status: 500 }
        );
      }
    }

    // Save/update client for future use
    if (documentData.client_name) {
      await supabase.from("clients").upsert(
        {
          user_id: user.id,
          name: documentData.client_name,
          email: documentData.client_email || null,
          nif: documentData.client_nif || null,
          address: documentData.client_address || null,
        },
        { onConflict: "user_id,name" }
      );
    }

    return NextResponse.json(doc, { status: 201 });
  } catch (error) {
    console.error("Create document error:", error);
    return NextResponse.json(
      { error: "Error al crear documento" },
      { status: 500 }
    );
  }
}
