import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Extract email from a website HTML (best effort)
async function scrapeEmailFromWebsite(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    clearTimeout(timeout);
    const html = await res.text();
    // Find emails in the HTML
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = html.match(emailRegex);
    if (!emails) return null;
    // Filter out common false positives
    const filtered = emails.filter(
      (e) =>
        !e.includes("example.com") &&
        !e.includes("sentry.io") &&
        !e.includes("wixpress") &&
        !e.includes("googleapis") &&
        !e.endsWith(".png") &&
        !e.endsWith(".jpg")
    );
    return filtered[0] || null;
  } catch {
    return null;
  }
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
    const { category, city, province, maxPages = 1 } = await request.json();

    if (!category || !city) {
      return NextResponse.json(
        { error: "Categoría y ciudad son obligatorias" },
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

    // Build query
    const locationPart = province ? `${city}, ${province}` : city;
    const query = `${category} en ${locationPart}, España`;

    // Fetch pages (max 3, 20 results each = 60)
    const pages = Math.min(Math.max(1, maxPages), 3);
    let allResults: Record<string, unknown>[] = [];
    let nextPageToken: string | null = null;

    for (let page = 0; page < pages; page++) {
      let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&language=es&key=${apiKey}`;
      if (nextPageToken) {
        url += `&pagetoken=${nextPageToken}`;
        // Google requires a short delay between page token requests
        await new Promise((r) => setTimeout(r, 2000));
      }

      const res = await fetch(url);
      const data = await res.json();

      if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
        if (page === 0) {
          return NextResponse.json(
            { error: `Google Maps error: ${data.status}` },
            { status: 500 }
          );
        }
        break;
      }

      allResults = allResults.concat(data.results || []);
      nextPageToken = data.next_page_token || null;
      if (!nextPageToken) break;
    }

    // Process each result
    const contacts = [];
    for (const place of allResults) {
      const p = place as {
        name: string;
        place_id: string;
        formatted_address?: string;
        rating?: number;
      };

      // Get place details
      const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${p.place_id}&fields=formatted_phone_number,website&language=es&key=${apiKey}`;
      const detailRes = await fetch(detailUrl);
      const detailData = await detailRes.json();
      const details = (detailData.result || {}) as {
        formatted_phone_number?: string;
        website?: string;
      };

      // Try to scrape email from website
      let email: string | null = null;
      if (details.website) {
        email = await scrapeEmailFromWebsite(details.website);
      }

      // Extract city from address
      const addressParts = p.formatted_address?.split(",") || [];
      const extractedCity =
        addressParts.length > 1 ? addressParts[1].trim() : city;

      contacts.push({
        business_name: p.name,
        category,
        province: province || null,
        city: extractedCity,
        phone: details.formatted_phone_number || null,
        email,
        website: details.website || null,
        google_maps_url: `https://www.google.com/maps/place/?q=place_id:${p.place_id}`,
        rating: p.rating || null,
        source: "google_maps",
      });
    }

    // Insert contacts (skip duplicates by business_name + city)
    let inserted = 0;
    let skipped = 0;
    for (const contact of contacts) {
      const { data: existing } = await supabase
        .from("contacts")
        .select("id")
        .eq("business_name", contact.business_name)
        .eq("city", contact.city)
        .maybeSingle();

      if (!existing) {
        const { error } = await supabase.from("contacts").insert(contact);
        if (!error) inserted++;
      } else {
        skipped++;
      }
    }

    return NextResponse.json({
      total_found: allResults.length,
      inserted,
      skipped,
      emails_found: contacts.filter((c) => c.email).length,
      message: `${inserted} nuevos contactos (${skipped} duplicados omitidos, ${contacts.filter((c) => c.email).length} con email)`,
    });
  } catch (error) {
    console.error("Scrape error:", error);
    return NextResponse.json(
      { error: "Error en el scraping" },
      { status: 500 }
    );
  }
}
