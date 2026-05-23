import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type { InvoiceData } from "./types";
import { formatLkrShort, formatInvoiceDate } from "./types";
import { getLogoDataUri } from "./fonts";

const AMBER = "#d97706";
const AMBER_LIGHT = "#f59e0b";
const AMBER_DEEP = "#b45309";
const AMBER_TINT = "rgba(217,119,6,0.08)";
const AMBER_TINT_MED = "rgba(217,119,6,0.18)";
const INK = "#141210";
const INK_PANEL = "#1c1915";
const INK_SOFT = "#5c5549";
const INK_FAINT = "#9a9285";
const CREAM = "#faf7f0";
const CREAM_DEEP = "#f3ece0";
const WHITE = "#ffffff";
const HAIRLINE = "rgba(20,18,16,0.10)";
const POSITIVE = "#15803d";

const styles = StyleSheet.create({
  page: {
    backgroundColor: CREAM,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: INK,
    paddingBottom: 38,
    position: "relative",
  },

  // ─── COMPACT HEADER ─────────────────────────────────────
  headerBand: {
    backgroundColor: INK_PANEL,
    paddingTop: 18,
    paddingBottom: 16,
    paddingHorizontal: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoFrame: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderColor: AMBER_LIGHT,
    borderRadius: 6,
    backgroundColor: WHITE,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    padding: 4,
  },
  logo: {
    width: 34,
    height: 34,
  },
  brandName: {
    fontFamily: "Times-Roman",
    fontSize: 17,
    letterSpacing: 4,
    color: WHITE,
    textTransform: "uppercase",
  },
  brandTagline: {
    marginTop: 3,
    fontSize: 6.5,
    letterSpacing: 2.5,
    color: AMBER_LIGHT,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
  },
  invoiceSide: {
    alignItems: "flex-end",
  },
  invoiceWord: {
    fontFamily: "Times-Roman",
    fontSize: 24,
    letterSpacing: 7,
    color: AMBER_LIGHT,
    textTransform: "uppercase",
  },
  invoiceNumber: {
    marginTop: 4,
    fontSize: 8.5,
    letterSpacing: 2,
    color: "#c4bdb0",
    fontFamily: "Helvetica-Bold",
  },
  amberBar: {
    height: 4,
    backgroundColor: AMBER,
  },

  // ─── BODY ───────────────────────────────────────────────
  body: {
    flex: 1,
    paddingHorizontal: 36,
    paddingTop: 26,
    paddingBottom: 16,
    flexDirection: "column",
  },
  // ─── BOTTOM FILLER (pushed to the bottom) ───────────────
  bottomFiller: {
    marginTop: "auto",
    paddingTop: 22,
  },
  thankWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  thankLine: {
    flex: 1,
    height: 0.6,
    backgroundColor: AMBER,
  },
  thankCenter: {
    paddingHorizontal: 16,
    alignItems: "center",
  },
  thankTitle: {
    fontFamily: "Times-Roman",
    fontSize: 18,
    color: AMBER_DEEP,
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  thankSub: {
    marginTop: 4,
    fontSize: 8,
    color: INK_FAINT,
    letterSpacing: 1.5,
    fontFamily: "Helvetica-Oblique",
  },

  termsRow: {
    flexDirection: "row",
    paddingTop: 4,
  },
  termsCol: {
    flex: 1,
    paddingRight: 18,
  },
  termsColLast: {
    flex: 1,
    paddingLeft: 18,
    borderLeftWidth: 0.5,
    borderLeftColor: HAIRLINE,
  },
  termsLabel: {
    fontSize: 6.5,
    letterSpacing: 1.8,
    color: AMBER_DEEP,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
  },
  termsText: {
    fontSize: 8.5,
    color: INK_SOFT,
    lineHeight: 1.6,
  },

  // Meta inline row
  metaStrip: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 22,
  },
  metaItem: {
    marginRight: 36,
  },
  metaLabel: {
    fontSize: 6,
    letterSpacing: 1.8,
    color: AMBER_DEEP,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
  },
  metaValue: {
    marginTop: 3,
    fontSize: 9.5,
    color: INK,
    fontFamily: "Helvetica-Bold",
  },

  faintRule: {
    height: 0.5,
    backgroundColor: HAIRLINE,
    marginBottom: 22,
  },

  // Addresses — 2 columns
  addressRow: {
    flexDirection: "row",
    marginBottom: 28,
  },
  addressBox: {
    flex: 1,
    paddingRight: 14,
  },
  addressBoxRight: {
    flex: 1,
    paddingLeft: 16,
    borderLeftWidth: 0.5,
    borderLeftColor: HAIRLINE,
  },
  sectionLabel: {
    fontSize: 6,
    letterSpacing: 2,
    color: AMBER_DEEP,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
  },
  addressName: {
    fontFamily: "Times-Roman",
    fontSize: 12,
    color: INK,
    marginBottom: 3,
  },
  addressText: {
    fontSize: 8.5,
    color: INK_SOFT,
    lineHeight: 1.5,
  },

  // Table
  tableWrap: {
    marginBottom: 24,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: INK_PANEL,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  th: {
    fontSize: 6,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: AMBER_LIGHT,
    fontFamily: "Helvetica-Bold",
  },
  thRight: { textAlign: "right" },
  thCenter: { textAlign: "center" },
  tr: {
    flexDirection: "row",
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderBottomWidth: 0.4,
    borderBottomColor: HAIRLINE,
    alignItems: "flex-start",
    backgroundColor: WHITE,
  },
  trAlt: {
    backgroundColor: AMBER_TINT,
  },
  itemBrand: {
    fontSize: 6,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: AMBER_DEEP,
    marginBottom: 2,
    fontFamily: "Helvetica-Bold",
  },
  itemName: {
    fontFamily: "Times-Roman",
    fontSize: 11,
    color: INK,
  },
  itemNote: {
    fontSize: 7,
    color: INK_FAINT,
    marginTop: 1,
    fontFamily: "Helvetica-Oblique",
  },
  tdMuted: {
    fontSize: 9,
    color: INK_SOFT,
    textAlign: "center",
  },
  tdPrice: {
    fontSize: 9,
    color: INK_SOFT,
    textAlign: "right",
  },
  tdTotal: {
    fontSize: 9.5,
    color: INK,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
  },

  // Bottom
  bottomRow: {
    flexDirection: "row",
    marginTop: 6,
  },
  notesCol: {
    flex: 1.2,
    paddingRight: 18,
  },
  notesText: {
    fontSize: 8.5,
    color: INK_SOFT,
    lineHeight: 1.55,
    fontFamily: "Helvetica-Oblique",
  },
  payzyBox: {
    marginTop: 10,
    padding: 9,
    backgroundColor: INK_PANEL,
    borderRadius: 3,
  },
  payzyLabel: {
    fontSize: 6,
    letterSpacing: 1.6,
    color: AMBER_LIGHT,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
  },
  payzyText: {
    fontSize: 8,
    color: "#c4bdb0",
    lineHeight: 1.5,
  },

  totalsCol: {
    flex: 1,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  totalDivider: {
    borderTopWidth: 0.5,
    borderTopColor: HAIRLINE,
    marginVertical: 3,
  },
  tLabel: {
    fontSize: 9,
    color: INK_SOFT,
  },
  tValue: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: INK,
  },
  discountValue: { color: POSITIVE },

  heroBlock: {
    marginTop: 10,
    paddingVertical: 11,
    paddingHorizontal: 12,
    backgroundColor: INK_PANEL,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: AMBER,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroLabel: {
    fontSize: 7,
    letterSpacing: 2.2,
    textTransform: "uppercase",
    color: AMBER_LIGHT,
    fontFamily: "Helvetica-Bold",
  },
  heroValue: {
    fontFamily: "Times-Roman",
    fontSize: 20,
    color: WHITE,
  },

  balanceBlock: {
    marginTop: 8,
    paddingVertical: 11,
    paddingHorizontal: 12,
    backgroundColor: AMBER_TINT,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: AMBER,
    borderStyle: "dashed",
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 7.5,
    letterSpacing: 2.2,
    textTransform: "uppercase",
    color: AMBER_DEEP,
    fontFamily: "Helvetica-Bold",
  },
  balanceValue: {
    fontFamily: "Times-Roman",
    fontSize: 18,
    color: AMBER_DEEP,
  },
  balanceCaption: {
    marginTop: 4,
    fontSize: 7,
    color: INK_FAINT,
    fontFamily: "Helvetica-Oblique",
  },

  statusRow: {
    marginTop: 8,
    alignItems: "flex-end",
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 11,
    borderRadius: 2,
    fontSize: 6.5,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
  },
  badgePaid: {
    backgroundColor: "rgba(21,128,61,0.12)",
    color: POSITIVE,
  },
  badgeAwaiting: {
    backgroundColor: AMBER_TINT_MED,
    color: AMBER_DEEP,
  },
  badgeCancelled: {
    backgroundColor: "rgba(185,28,28,0.1)",
    color: "#b91c1c",
  },

  // Footer
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: INK_PANEL,
    paddingVertical: 9,
    paddingHorizontal: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerBrand: {
    fontFamily: "Times-Roman",
    fontSize: 8.5,
    color: AMBER_LIGHT,
    letterSpacing: 2.5,
    textTransform: "uppercase",
  },
  footerLinks: {
    fontSize: 7,
    color: "#8a8278",
    letterSpacing: 0.3,
  },
  footerCopy: {
    fontSize: 6.5,
    color: "#6a635a",
    textAlign: "right",
  },
});

const COLS = [
  { width: "48%" },
  { width: "12%" },
  { width: "10%" },
  { width: "14%" },
  { width: "16%" },
];

function StatusBadgeView({ status }: { status: InvoiceData["status"] }) {
  const label =
    status === "paid"
      ? "Paid"
      : status === "awaiting"
      ? "Awaiting Payment"
      : status === "cancelled"
      ? "Cancelled"
      : status === "advance"
      ? "Advance Payment"
      : "Draft";

  const variant =
    status === "paid"
      ? styles.badgePaid
      : status === "cancelled"
      ? styles.badgeCancelled
      : styles.badgeAwaiting;

  return (
    <View style={styles.statusRow}>
      <Text style={[styles.statusBadge, variant]}>{label}</Text>
    </View>
  );
}

function AddressBlock({
  customer,
  label,
  rightSide,
}: {
  customer: NonNullable<InvoiceData["billedTo"]>;
  label: string;
  rightSide?: boolean;
}) {
  const region = [customer.city, customer.state, customer.zip].filter(Boolean).join(", ");
  const contact = [customer.email, customer.phone].filter(Boolean).join("   ·   ");
  return (
    <View style={rightSide ? styles.addressBoxRight : styles.addressBox}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <Text style={styles.addressName}>{customer.name || "—"}</Text>
      {customer.address ? <Text style={styles.addressText}>{customer.address}</Text> : null}
      {region ? <Text style={styles.addressText}>{region}</Text> : null}
      <Text style={styles.addressText}>Sri Lanka</Text>
      {contact ? <Text style={[styles.addressText, { marginTop: 3 }]}>{contact}</Text> : null}
    </View>
  );
}

export function InvoiceDocument({ data }: { data: InvoiceData }) {
  const showDiscount = (data.discount ?? 0) > 0;
  const advanced = data.showAdvancedBreakdown === true;
  const retailSubtotal =
    data.retailSubtotal ??
    data.items.reduce(
      (s, it) => s + it.quantity * (it.retailPrice ?? it.unitPrice),
      0,
    );
  const orderTotal = data.total;
  const advanceAmount = data.advanceAmount ?? orderTotal;
  const balanceDue = data.balanceDue ?? Math.max(0, orderTotal - advanceAmount);
  const shippedTo = data.shippedTo ?? data.billedTo;
  const sameAsBilling =
    !data.shippedTo ||
    (data.shippedTo.name === data.billedTo.name &&
      data.shippedTo.address === data.billedTo.address &&
      data.shippedTo.city === data.billedTo.city);

  const logoSrc = getLogoDataUri();

  return (
    <Document title={`Invoice ${data.invoiceNumber}`} author="Aroma Notes">
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.headerBand}>
          <View style={styles.brandRow}>
            <View style={styles.logoFrame}>
              <Image src={logoSrc} style={styles.logo} />
            </View>
            <View>
              <Text style={styles.brandName}>Aroma Notes</Text>
              <Text style={styles.brandTagline}>Where every scent tells a story</Text>
            </View>
          </View>
          <View style={styles.invoiceSide}>
            <Text style={styles.invoiceWord}>Invoice</Text>
            <Text style={styles.invoiceNumber}>{data.invoiceNumber}</Text>
          </View>
        </View>
        <View style={styles.amberBar} />

        <View style={styles.body}>
          {/* META ROW */}
          <View style={styles.metaStrip}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Date</Text>
              <Text style={styles.metaValue}>{formatInvoiceDate(data.invoiceDate)}</Text>
            </View>
            {data.orderNumber ? (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Order</Text>
                <Text style={styles.metaValue}>{data.orderNumber}</Text>
              </View>
            ) : null}
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Payment</Text>
              <Text style={styles.metaValue}>{data.paymentLabel}</Text>
            </View>
            {data.dueDate ? (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Due</Text>
                <Text style={styles.metaValue}>{formatInvoiceDate(data.dueDate)}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.faintRule} />

          {/* ADDRESSES */}
          <View style={styles.addressRow}>
            <AddressBlock label="Billed To" customer={data.billedTo} />
            {sameAsBilling ? (
              <View style={styles.addressBoxRight}>
                <Text style={styles.sectionLabel}>Shipped To</Text>
                <Text style={styles.addressName}>Same as Billing</Text>
                {data.billedTo.address ? (
                  <Text style={styles.addressText}>{data.billedTo.address}</Text>
                ) : null}
                {[data.billedTo.city, data.billedTo.state, data.billedTo.zip]
                  .filter(Boolean)
                  .join(", ") ? (
                  <Text style={styles.addressText}>
                    {[data.billedTo.city, data.billedTo.state, data.billedTo.zip]
                      .filter(Boolean)
                      .join(", ")}
                  </Text>
                ) : null}
                <Text style={styles.addressText}>Sri Lanka</Text>
              </View>
            ) : (
              <AddressBlock label="Shipped To" customer={shippedTo} rightSide />
            )}
          </View>

          {/* TABLE */}
          <View style={styles.tableWrap}>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { width: COLS[0].width }]}>Fragrance</Text>
              <Text style={[styles.th, styles.thCenter, { width: COLS[1].width }]}>Size</Text>
              <Text style={[styles.th, styles.thCenter, { width: COLS[2].width }]}>Qty</Text>
              <Text style={[styles.th, styles.thRight, { width: COLS[3].width }]}>Unit</Text>
              <Text style={[styles.th, styles.thRight, { width: COLS[4].width }]}>Total</Text>
            </View>
            {data.items.map((item, i) => {
              const unitPrice = item.retailPrice ?? item.unitPrice;
              return (
                <View
                  key={i}
                  style={[styles.tr, i % 2 === 1 ? styles.trAlt : {}]}
                  wrap={false}
                >
                  <View style={{ width: COLS[0].width }}>
                    {item.brand ? <Text style={styles.itemBrand}>{item.brand}</Text> : null}
                    <Text style={styles.itemName}>{item.name}</Text>
                    {item.note ? <Text style={styles.itemNote}>{item.note}</Text> : null}
                  </View>
                  <Text style={[styles.tdMuted, { width: COLS[1].width }]}>
                    {item.size || "—"}
                  </Text>
                  <Text style={[styles.tdMuted, { width: COLS[2].width }]}>
                    {item.quantity}
                  </Text>
                  <Text style={[styles.tdPrice, { width: COLS[3].width }]}>
                    {formatLkrShort(unitPrice)}
                  </Text>
                  <Text style={[styles.tdTotal, { width: COLS[4].width }]}>
                    {formatLkrShort(unitPrice * item.quantity)}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* NOTES + TOTALS */}
          <View style={styles.bottomRow}>
            <View style={styles.notesCol}>
              <Text style={styles.sectionLabel}>Notes</Text>
              <Text style={styles.notesText}>
                {data.notes ||
                  "Thank you for your order. All fragrances are 100% authentic, hand-selected, and exclusively imported."}
              </Text>
              {data.payzyPlan ? (
                <View style={styles.payzyBox}>
                  <Text style={styles.payzyLabel}>Payzy Installment Plan</Text>
                  <Text style={styles.payzyText}>
                    {data.payzyPlan.installments} payments ·{" "}
                    {formatLkrShort(data.payzyPlan.perInstallment)} each · Interest-free
                  </Text>
                </View>
              ) : null}
            </View>

            <View style={styles.totalsCol}>
              <Text style={styles.sectionLabel}>Summary</Text>
              <View style={styles.totalRow}>
                <Text style={styles.tLabel}>Subtotal</Text>
                <Text style={styles.tValue}>
                  {formatLkrShort(advanced ? retailSubtotal : data.subtotal)}
                </Text>
              </View>
              {showDiscount ? (
                <View style={styles.totalRow}>
                  <Text style={styles.tLabel}>Discount</Text>
                  <Text style={[styles.tValue, styles.discountValue]}>
                    – {formatLkrShort(data.discount ?? 0)}
                  </Text>
                </View>
              ) : null}
              <View style={styles.totalRow}>
                <Text style={styles.tLabel}>Delivery</Text>
                <Text style={styles.tValue}>{formatLkrShort(data.deliveryFee)}</Text>
              </View>
              {advanced ? (
                <>
                  <View style={styles.totalDivider} />
                  <View style={styles.totalRow}>
                    <Text style={styles.tLabel}>Order Total</Text>
                    <Text style={styles.tValue}>{formatLkrShort(orderTotal)}</Text>
                  </View>
                  <View style={styles.heroBlock}>
                    <Text style={styles.heroLabel}>Advance Paid</Text>
                    <Text style={styles.heroValue}>{formatLkrShort(advanceAmount)}</Text>
                  </View>
                  {balanceDue > 0 ? (
                    <View style={styles.balanceBlock}>
                      <View style={styles.balanceRow}>
                        <Text style={styles.balanceLabel}>Balance Due</Text>
                        <Text style={styles.balanceValue}>{formatLkrShort(balanceDue)}</Text>
                      </View>
                      <Text style={styles.balanceCaption}>
                        Payable on delivery or collection.
                      </Text>
                    </View>
                  ) : null}
                </>
              ) : (
                <View style={styles.heroBlock}>
                  <Text style={styles.heroLabel}>Total Due</Text>
                  <Text style={styles.heroValue}>{formatLkrShort(data.total)}</Text>
                </View>
              )}
              <StatusBadgeView status={data.status} />
            </View>
          </View>

          {/* BOTTOM FILLER — pushed to bottom of page */}
          <View style={styles.bottomFiller}>
            <View style={styles.thankWrap}>
              <View style={styles.thankLine} />
              <View style={styles.thankCenter}>
                <Text style={styles.thankTitle}>Thank You</Text>
                <Text style={styles.thankSub}>
                  Every scent tells a story — yours starts here
                </Text>
              </View>
              <View style={styles.thankLine} />
            </View>

            <View style={styles.termsRow}>
              <View style={styles.termsCol}>
                <Text style={styles.termsLabel}>Authenticity</Text>
                <Text style={styles.termsText}>
                  100% authentic fragrances, hand-selected and exclusively imported from
                  the Yusuf Bhai Collection. Please retain this invoice for warranty and
                  reference.
                </Text>
              </View>
              <View style={styles.termsColLast}>
                <Text style={styles.termsLabel}>Contact</Text>
                <Text style={styles.termsText}>
                  aromanotes.lk{"\n"}
                  WhatsApp · wa.me/94721922332{"\n"}
                  Instagram · @aroma.notes_
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerBrand}>Aroma Notes</Text>
          <Text style={styles.footerLinks}>
            aromanotes.lk  ·  @aroma.notes_  ·  wa.me/94721922332
          </Text>
          <Text style={styles.footerCopy}>
            © {data.invoiceDate.getFullYear()} Aroma Notes · Exclusive Imports
          </Text>
        </View>
      </Page>
    </Document>
  );
}
