import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ExtractedInvoiceData } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

const EXTRACTION_PROMPT = `Eres un asistente que extrae datos de facturas/presupuestos a partir de texto en lenguaje natural.
El usuario es un autónomo español (electricista, fontanero, pintor, etc.) que describe el trabajo realizado y cuánto cobra.

Extrae la siguiente información en formato JSON:
- client_name: nombre del cliente (null si no se menciona)
- client_email: email del cliente (null si no se menciona)
- client_nif: NIF/CIF del cliente (null si no se menciona)
- client_address: dirección del cliente (null si no se menciona)
- items: array de líneas de factura, cada una con:
  - description: descripción del trabajo o material
  - quantity: cantidad (por defecto 1)
  - unit_price: precio unitario en euros
- notes: notas adicionales (null si no hay)

Reglas:
- Si el usuario menciona un precio total sin desglosar, pon una sola línea con quantity=1
- Los precios son SIEMPRE sin IVA (base imponible)
- Si menciona materiales y mano de obra por separado, crea líneas separadas
- Si no queda claro el precio unitario vs total, asume que es el total de esa línea
- Responde SOLO con el JSON válido, sin markdown ni explicaciones`;

export async function extractInvoiceData(
  text: string
): Promise<ExtractedInvoiceData> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  const result = await model.generateContent([
    EXTRACTION_PROMPT,
    `Texto del usuario: "${text}"`,
  ]);

  const response = result.response.text();
  // Clean potential markdown code blocks
  const cleaned = response.replace(/```json\n?|\n?```/g, "").trim();
  return JSON.parse(cleaned);
}

export async function extractInvoiceFromAudio(
  audioBase64: string,
  mimeType: string
): Promise<ExtractedInvoiceData> {
  // flash-lite doesn't support audio — use full flash for audio input
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const result = await model.generateContent([
    EXTRACTION_PROMPT,
    {
      inlineData: {
        mimeType,
        data: audioBase64,
      },
    },
  ]);

  const response = result.response.text();
  const cleaned = response.replace(/```json\n?|\n?```/g, "").trim();
  return JSON.parse(cleaned);
}

export async function generateOutreachEmail(
  businessName: string,
  category: string,
  province: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  const prompt = `Genera un email de outreach corto y personalizado en español para un autónomo.

Datos del destinatario:
- Negocio: ${businessName}
- Categoría: ${category}
- Provincia: ${province}

El email debe:
- Ser breve (máximo 150 palabras)
- Tono cercano pero profesional, usar "tú"
- Mencionar que tenemos una app que les permite crear facturas y presupuestos hablando al móvil
- Destacar que es gratis para empezar y que no hace falta saber de informática
- Incluir una llamada a la acción clara
- NO incluir subject/asunto, solo el cuerpo del email

Responde SOLO con el texto del email, sin comillas ni formato extra.`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}
