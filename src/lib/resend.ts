import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendInvoiceEmail({
  to,
  clientName,
  documentType,
  documentNumber,
  companyName,
  pdfBuffer,
}: {
  to: string;
  clientName: string;
  documentType: "invoice" | "quote";
  documentNumber: string;
  companyName: string;
  pdfBuffer: Buffer;
}) {
  const typeLabel = documentType === "invoice" ? "Factura" : "Presupuesto";
  const filename = `${documentNumber}.pdf`;

  const { data, error } = await getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject: `${typeLabel} ${documentNumber} de ${companyName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hola ${clientName},</h2>
        <p>Adjunto encontrarás ${typeLabel.toLowerCase()} <strong>${documentNumber}</strong> de <strong>${companyName}</strong>.</p>
        ${documentType === "quote" ? "<p>Si tienes alguna duda sobre el presupuesto, no dudes en contactarnos.</p>" : "<p>Gracias por confiar en nosotros.</p>"}
        <p>Un saludo,<br/>${companyName}</p>
      </div>
    `,
    attachments: [
      {
        filename,
        content: pdfBuffer,
      },
    ],
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data;
}
