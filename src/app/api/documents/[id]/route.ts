import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
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

  const { data: doc } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!doc) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const { data: items } = await supabase
    .from("document_items")
    .select("*")
    .eq("document_id", id);

  return NextResponse.json({ ...doc, items: items || [] });
}

export async function PATCH(
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

  // Verify ownership
  const { data: existing } = await supabase
    .from("documents")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { items, ...documentData } = body;

    // Recalculate totals
    const subtotal = items.reduce(
      (sum: number, item: { quantity: number; unit_price: number }) =>
        sum + item.quantity * item.unit_price,
      0
    );
    const ivaPercent = documentData.iva_percent ?? 21;
    const ivaAmount = subtotal * (ivaPercent / 100);
    const total = subtotal + ivaAmount;

    // Update document
    const { error: docError } = await supabase
      .from("documents")
      .update({
        document_type: documentData.document_type,
        client_name: documentData.client_name,
        client_email: documentData.client_email,
        client_nif: documentData.client_nif,
        client_address: documentData.client_address,
        subtotal: Math.round(subtotal * 100) / 100,
        iva_percent: ivaPercent,
        iva_amount: Math.round(ivaAmount * 100) / 100,
        total: Math.round(total * 100) / 100,
        valid_until: documentData.valid_until,
        notes: documentData.notes,
      })
      .eq("id", id);

    if (docError) {
      return NextResponse.json({ error: docError.message }, { status: 500 });
    }

    // Replace items: delete old, insert new
    await supabase.from("document_items").delete().eq("document_id", id);

    if (items && items.length > 0) {
      const newItems = items.map(
        (item: { description: string; quantity: number; unit_price: number }) => ({
          document_id: id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          amount: Math.round(item.quantity * item.unit_price * 100) / 100,
        })
      );

      const { error: itemsError } = await supabase
        .from("document_items")
        .insert(newItems);

      if (itemsError) {
        return NextResponse.json({ error: itemsError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update document error:", error);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}
