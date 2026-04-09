import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>

        <h1 className="text-3xl font-bold mb-2">Política de Privacidad</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Última actualización: abril 2026
        </p>

        <div className="prose prose-gray max-w-none space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold mt-8 mb-3">1. Responsable del tratamiento</h2>
            <p>
              El responsable del tratamiento de tus datos es el titular de VozFactura,
              accesible en factura.ai-implementer.com. Para cualquier consulta sobre
              privacidad puedes escribir a: <strong>privacidad@ai-implementer.com</strong>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mt-8 mb-3">2. Datos que recogemos</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Datos de cuenta:</strong> email y contraseña (gestionados por Supabase Auth).</li>
              <li><strong>Datos de empresa:</strong> nombre comercial, NIF, dirección, teléfono, IBAN, logo. Los introduces tú voluntariamente para que aparezcan en tus facturas.</li>
              <li><strong>Datos de clientes:</strong> nombre, email, NIF y dirección de tus clientes, que introduces al crear facturas o presupuestos.</li>
              <li><strong>Audio:</strong> si usas la función de voz, el audio se envía a Google Gemini para su procesamiento. No almacenamos el audio.</li>
              <li><strong>Documentos:</strong> facturas y presupuestos que generas, almacenados en tu cuenta.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mt-8 mb-3">3. Finalidad del tratamiento</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Permitirte crear, gestionar y enviar facturas y presupuestos.</li>
              <li>Generar PDFs con tus datos de empresa.</li>
              <li>Enviar documentos por email a tus clientes (cuando tú lo solicites).</li>
              <li>Guardar tus clientes frecuentes para autocompletar en futuras facturas.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mt-8 mb-3">4. Base legal</h2>
            <p>
              El tratamiento se basa en tu consentimiento al registrarte y utilizar el
              servicio, así como en la ejecución del servicio que solicitas (art. 6.1.a y 6.1.b RGPD).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mt-8 mb-3">5. Terceros y encargados del tratamiento</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Supabase:</strong> base de datos y autenticación (servidores en la UE).</li>
              <li><strong>Google (Gemini):</strong> procesamiento de audio y texto para extracción de datos de factura.</li>
              <li><strong>Resend:</strong> envío de emails con documentos adjuntos.</li>
              <li><strong>Vercel:</strong> alojamiento de la aplicación web.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mt-8 mb-3">6. Conservación de datos</h2>
            <p>
              Tus datos se conservan mientras mantengas tu cuenta activa. Puedes solicitar
              la eliminación de tu cuenta y todos tus datos en cualquier momento escribiendo
              a privacidad@ai-implementer.com.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mt-8 mb-3">7. Tus derechos</h2>
            <p>Tienes derecho a:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Acceder a tus datos personales.</li>
              <li>Rectificar datos inexactos.</li>
              <li>Solicitar la supresión de tus datos.</li>
              <li>Oponerte al tratamiento.</li>
              <li>Portar tus datos a otro servicio.</li>
            </ul>
            <p className="mt-2">
              Para ejercer estos derechos, escribe a privacidad@ai-implementer.com.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mt-8 mb-3">8. Cookies</h2>
            <p>
              Utilizamos cookies técnicas necesarias para el funcionamiento de la
              aplicación (sesión de usuario). No utilizamos cookies de seguimiento
              ni publicidad.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mt-8 mb-3">9. Seguridad</h2>
            <p>
              Aplicamos medidas técnicas para proteger tus datos: cifrado en tránsito
              (HTTPS), control de acceso por usuario (Row Level Security), y las claves
              de API se almacenan en el servidor, nunca expuestas al navegador.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
