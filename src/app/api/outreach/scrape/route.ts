import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Google Maps scraping via Places API (Text Search)
// Requires GOOGLE_MAPS_API_KEY in env (or use GOOGLE_GEMINI_API_KEY if same project)
// For MVP: we use a simple fetch-based approach

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { category, province } = await request.json();

    if (!category || !province) {
      return NextResponse.json(
        { error: "Categoría y provincia son obligatorias" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Maps API key no configurada" },
        { status: 500 }
      );
    }

    // Use Google Places Text Search API
    const query = `${category} en ${province}, España`;
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&language=es&key=${apiKey}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      return NextResponse.json(
        { error: `Google Maps error: ${data.status}` },
        { status: 500 }
      );
    }

    const results = data.results || [];
    const contacts = [];

    for (const place of results) {
      // Get place details for phone, website
      const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=formatted_phone_number,website&language=es&key=${apiKey}`;
      const detailRes = await fetch(detailUrl);
      const detailData = await detailRes.json();
      const details = detailData.result || {};

      const contact = {
        business_name: place.name,
        category,
        province,
        city: place.formatted_address?.split(",")[1]?.trim() || null,
        phone: details.formatted_phone_number || null,
        website: details.website || null,
        google_maps_url: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
        rating: place.rating || null,
        source: "google_maps",
      };

      contacts.push(contact);
    }

    // Insert contacts (skip duplicates based on business_name + province)
    let inserted = 0;
    for (const contact of contacts) {
      const { data: existing } = await supabase
        .from("contacts")
        .select("id")
        .eq("business_name", contact.business_name)
        .eq("province", contact.province)
        .maybeSingle();

      if (!existing) {
        const { error } = await supabase.from("contacts").insert(contact);
        if (!error) inserted++;
      }
    }

    return NextResponse.json({
      total_found: results.length,
      inserted,
      message: `${inserted} nuevos contactos guardados de ${results.length} encontrados`,
    });
  } catch (error) {
    console.error("Scrape error:", error);
    return NextResponse.json(
      { error: "Error en el scraping" },
      { status: 500 }
    );
  }
}
