import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import type {
  Document as DocType,
  DocumentItem,
  Profile,
} from "@/types";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#111827",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  companyHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  companyLogo: {
    width: 50,
    height: 50,
    borderRadius: 4,
    objectFit: "contain" as const,
  },
  companyName: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#2563EB",
    marginBottom: 4,
  },
  companyInfo: {
    fontSize: 9,
    color: "#6B7280",
    lineHeight: 1.5,
  },
  docTitle: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
    color: "#111827",
  },
  docNumber: {
    fontSize: 11,
    textAlign: "right",
    color: "#6B7280",
    marginTop: 4,
  },
  docDate: {
    fontSize: 9,
    textAlign: "right",
    color: "#6B7280",
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#6B7280",
    textTransform: "uppercase" as const,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  clientInfo: {
    fontSize: 10,
    lineHeight: 1.5,
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  colDescription: { flex: 4 },
  colQuantity: { flex: 1, textAlign: "right" },
  colPrice: { flex: 2, textAlign: "right" },
  colAmount: { flex: 2, textAlign: "right" },
  headerText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: "#6B7280",
    textTransform: "uppercase" as const,
  },
  totalsContainer: {
    alignItems: "flex-end",
    marginBottom: 30,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingVertical: 3,
    width: 200,
  },
  totalLabel: {
    flex: 1,
    textAlign: "right",
    color: "#6B7280",
    paddingRight: 12,
  },
  totalValue: {
    width: 80,
    textAlign: "right",
  },
  grandTotal: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingVertical: 6,
    width: 200,
    borderTopWidth: 2,
    borderTopColor: "#111827",
    marginTop: 4,
  },
  grandTotalLabel: {
    flex: 1,
    textAlign: "right",
    paddingRight: 12,
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
  },
  grandTotalValue: {
    width: 80,
    textAlign: "right",
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
  },
  notes: {
    fontSize: 9,
    color: "#6B7280",
    lineHeight: 1.5,
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#F9FAFB",
  },
  bankInfo: {
    fontSize: 9,
    color: "#6B7280",
    lineHeight: 1.5,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 15,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#9CA3AF",
  },
});

function formatCurrency(amount: number) {
  return (
    new Intl.NumberFormat("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + " €"
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

interface InvoicePDFProps {
  document: DocType;
  items: DocumentItem[];
  profile: Profile;
}

export function InvoicePDF({ document: doc, items, profile }: InvoicePDFProps) {
  const typeLabel = doc.document_type === "invoice" ? "FACTURA" : "PRESUPUESTO";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyHeader}>
            {profile.logo_url && (
              <Image src={profile.logo_url} style={styles.companyLogo} />
            )}
            <View>
              <Text style={styles.companyName}>{profile.company_name}</Text>
              {profile.phone && (
                <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", color: "#111827", marginBottom: 2 }}>
                  Tel: {profile.phone}
                </Text>
              )}
              <Text style={styles.companyInfo}>
                NIF: {profile.nif}
                {"\n"}
                {profile.address}
                {"\n"}
                {profile.postal_code} {profile.city}
                {profile.province ? `, ${profile.province}` : ""}
                {profile.email ? `\n${profile.email}` : ""}
              </Text>
            </View>
          </View>
          <View>
            <Text style={styles.docTitle}>{typeLabel}</Text>
            <Text style={styles.docNumber}>{doc.document_number}</Text>
            <Text style={styles.docDate}>
              Fecha: {formatDate(doc.created_at)}
            </Text>
            {doc.document_type === "quote" && doc.valid_until && (
              <Text style={styles.docDate}>
                Válido hasta: {formatDate(doc.valid_until)}
              </Text>
            )}
          </View>
        </View>

        {/* Client */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cliente</Text>
          <Text style={styles.clientInfo}>
            {doc.client_name || "—"}
            {doc.client_nif ? `\nNIF: ${doc.client_nif}` : ""}
            {doc.client_address ? `\n${doc.client_address}` : ""}
            {doc.client_email ? `\n${doc.client_email}` : ""}
          </Text>
        </View>

        {/* Items table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.colDescription]}>
              Descripción
            </Text>
            <Text style={[styles.headerText, styles.colQuantity]}>Cant.</Text>
            <Text style={[styles.headerText, styles.colPrice]}>
              Precio ud.
            </Text>
            <Text style={[styles.headerText, styles.colAmount]}>Importe</Text>
          </View>
          {items.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.colDescription}>{item.description}</Text>
              <Text style={styles.colQuantity}>{item.quantity}</Text>
              <Text style={styles.colPrice}>
                {formatCurrency(item.unit_price)}
              </Text>
              <Text style={styles.colAmount}>
                {formatCurrency(item.amount)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(doc.subtotal)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              IVA ({doc.iva_percent}%):
            </Text>
            <Text style={styles.totalValue}>
              {formatCurrency(doc.iva_amount)}
            </Text>
          </View>
          <View style={styles.grandTotal}>
            <Text style={styles.grandTotalLabel}>TOTAL:</Text>
            <Text style={styles.grandTotalValue}>
              {formatCurrency(doc.total)}
            </Text>
          </View>
        </View>

        {/* Notes */}
        {doc.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notas</Text>
            <Text style={styles.notes}>{doc.notes}</Text>
          </View>
        )}

        {/* Bank info */}
        {profile.bank_iban && doc.document_type === "invoice" && (
          <View style={styles.bankInfo}>
            <Text style={styles.sectionTitle}>Datos de pago</Text>
            <Text>IBAN: {profile.bank_iban}</Text>
            <Text>Titular: {profile.company_name}</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Generado con VozFactura
        </Text>
      </Page>
    </Document>
  );
}
