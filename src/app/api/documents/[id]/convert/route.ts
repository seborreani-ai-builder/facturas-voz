import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

  // Get the quote
  const { data: quote } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("document_type", "quote")
    .single();

  if (!quote) {
    return NextResponse.json(
      { error: "Presupuesto no encontrado" },
      { status: 404 }
    );
  }

  // Get items
  const { data: items } = await supabase
    .from("document_items")
    .select("*")
    .eq("document_id", id);

  // Generate invoice number
  const { data: invoiceNumber } = await supabase.rpc(
    "generate_document_number",
    {
      p_user_id: user.id,
      p_document_type: "invoice",
    }
  );

  // Create invoice from quote data
  const { data: invoice, error: invoiceError } = await supabase
    .from("documents")
    .insert({
      user_id: user.id,
      document_type: "invoice",
      document_number: invoiceNumber,
      client_name: quote.client_name,
      client_email: quote.client_email,
      client_nif: quote.client_nif,
      client_address: quote.client_address,
      subtotal: quote.subtotal,
      iva_percent: quote.iva_percent,
      iva_amount: quote.iva_amount,
      total: quote.total,
      status: "draft",
      notes: quote.notes,
      original_text: quote.original_text,
    })
    .select()
    .single();

  if (invoiceError) {
    return NextResponse.json(
      { error: "Error creando factura: " + invoiceError.message },
      { status: 500 }
    );
  }

  // Copy items
  if (items && items.length > 0) {
    const newItems = items.map((item) => ({
      document_id: invoice.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      amount: item.amount,
    }));

    await supabase.from("document_items").insert(newItems);
  }

  // Update quote status to accepted
  await supabase
    .from("documents")
    .update({ status: "accepted" })
    .eq("id", id);

  return NextResponse.json(invoice, { status: 201 });
}
