import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

type OrderEmailData = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: { name: string; brand?: string | null; size?: string | null; quantity: number; price: number }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  address: string;
  city: string;
  phone: string;
};

function formatLkr(amount: number): string {
  return `LKR ${Math.round(amount).toLocaleString("en-LK")}`;
}

function paymentLabel(method: string): string {
  switch (method) {
    case "cod": return "Cash on Delivery";
    case "bank_deposit": return "Bank Deposit";
    case "payzy": return "Payzy (Buy Now, Pay Later)";
    default: return method;
  }
}

function itemsTableHtml(items: OrderEmailData["items"]): string {
  return items
    .map(
      (it) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #eef1f6;font-family:'Segoe UI',Arial,sans-serif;font-size:14px;color:#1a1f36">
          <div style="font-weight:600">${it.name}</div>
          <div style="margin-top:2px;font-size:12px;color:#5d6478">
            ${it.brand ? `Brand: ${it.brand}` : "Brand: -"} &nbsp;|&nbsp; ${it.size ? `Size: ${it.size}` : "Size: -"}
          </div>
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-family:'Segoe UI',Arial,sans-serif;font-size:14px;color:#333;text-align:center">${it.quantity}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-family:'Segoe UI',Arial,sans-serif;font-size:14px;color:#333;text-align:right">${formatLkr(it.price * it.quantity)}</td>
      </tr>`,
    )
    .join("");
}

function baseLayout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f4f7fb;-webkit-font-smoothing:antialiased">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:32px 16px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(7,20,53,0.10)">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0f172a 0%,#1e3a8a 55%,#0ea5a5 100%);padding:30px 32px;text-align:center">
            <h1 style="margin:0;font-family:'Segoe UI',Arial,sans-serif;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:1px">AROMA NOTES</h1>
            <p style="margin:4px 0 0;font-family:'Segoe UI',Arial,sans-serif;font-size:12px;color:rgba(255,255,255,0.78);letter-spacing:2px;text-transform:uppercase">Luxury Fragrance Experience</p>
          </td>
        </tr>
        <!-- Body -->
        <tr><td style="padding:32px">${body}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="background:#fafafa;padding:20px 32px;text-align:center;border-top:1px solid #eee">
            <p style="margin:0;font-family:'Segoe UI',Arial,sans-serif;font-size:12px;color:#999">Aroma Notes &mdash; Premium Fragrances, Sri Lanka</p>
            <p style="margin:4px 0 0;font-family:'Segoe UI',Arial,sans-serif;font-size:11px;color:#bbb">This is an automated email. Please do not reply directly.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function buildOrderConfirmationHtml(data: OrderEmailData): string {
  const body = `
    <h2 style="margin:0 0 4px;font-family:'Segoe UI',Arial,sans-serif;font-size:22px;color:#0f172a">Order Confirmed!</h2>
    <p style="margin:0 0 24px;font-family:'Segoe UI',Arial,sans-serif;font-size:14px;color:#4b5563;line-height:1.65">Hi ${data.customerName}, thank you for choosing Aroma Notes. We have received your order and started preparing it with care.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fbff;border:1px solid #e6eefb;border-radius:12px;padding:16px;margin-bottom:24px">
      <tr>
        <td style="padding:8px 16px">
          <p style="margin:0;font-family:'Segoe UI',Arial,sans-serif;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px">Order Number</p>
          <p style="margin:4px 0 0;font-family:'Segoe UI',Arial,sans-serif;font-size:18px;font-weight:700;color:#1a1a2e">${data.orderNumber}</p>
        </td>
        <td style="padding:8px 16px;text-align:right">
          <p style="margin:0;font-family:'Segoe UI',Arial,sans-serif;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px">Payment</p>
          <p style="margin:4px 0 0;font-family:'Segoe UI',Arial,sans-serif;font-size:14px;font-weight:600;color:#1a1a2e">${paymentLabel(data.paymentMethod)}</p>
        </td>
      </tr>
    </table>

    <h3 style="margin:0 0 12px;font-family:'Segoe UI',Arial,sans-serif;font-size:14px;font-weight:700;color:#0f172a;text-transform:uppercase;letter-spacing:1px">Items Ordered</h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e7ecf4;border-radius:10px;overflow:hidden;margin-bottom:20px">
      <tr style="background:#f5f8fd">
        <th style="padding:10px 12px;font-family:'Segoe UI',Arial,sans-serif;font-size:12px;color:#666;text-align:left;text-transform:uppercase;letter-spacing:0.5px">Product</th>
        <th style="padding:10px 12px;font-family:'Segoe UI',Arial,sans-serif;font-size:12px;color:#666;text-align:center;text-transform:uppercase;letter-spacing:0.5px">Qty</th>
        <th style="padding:10px 12px;font-family:'Segoe UI',Arial,sans-serif;font-size:12px;color:#666;text-align:right;text-transform:uppercase;letter-spacing:0.5px">Amount</th>
      </tr>
      ${itemsTableHtml(data.items)}
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      <tr>
        <td style="padding:6px 0;font-family:'Segoe UI',Arial,sans-serif;font-size:14px;color:#666">Subtotal</td>
        <td style="padding:6px 0;font-family:'Segoe UI',Arial,sans-serif;font-size:14px;color:#333;text-align:right">${formatLkr(data.subtotal)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-family:'Segoe UI',Arial,sans-serif;font-size:14px;color:#666">Delivery Fee</td>
        <td style="padding:6px 0;font-family:'Segoe UI',Arial,sans-serif;font-size:14px;color:#333;text-align:right">${formatLkr(data.deliveryFee)}</td>
      </tr>
      <tr>
        <td style="padding:10px 0 0;font-family:'Segoe UI',Arial,sans-serif;font-size:16px;font-weight:700;color:#1a1a2e;border-top:2px solid #eee">Total</td>
        <td style="padding:10px 0 0;font-family:'Segoe UI',Arial,sans-serif;font-size:16px;font-weight:700;color:#1a1a2e;text-align:right;border-top:2px solid #eee">${formatLkr(data.total)}</td>
      </tr>
    </table>

    <h3 style="margin:0 0 12px;font-family:'Segoe UI',Arial,sans-serif;font-size:14px;font-weight:700;color:#0f172a;text-transform:uppercase;letter-spacing:1px">Delivery Details</h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fbff;border:1px solid #e6eefb;border-radius:10px;padding:12px 16px;margin-bottom:24px">
      <tr><td style="padding:4px 16px;font-family:'Segoe UI',Arial,sans-serif;font-size:14px;color:#333"><strong>${data.customerName}</strong></td></tr>
      <tr><td style="padding:4px 16px;font-family:'Segoe UI',Arial,sans-serif;font-size:14px;color:#555">${data.address}</td></tr>
      <tr><td style="padding:4px 16px;font-family:'Segoe UI',Arial,sans-serif;font-size:14px;color:#555">${data.city}</td></tr>
      <tr><td style="padding:4px 16px;font-family:'Segoe UI',Arial,sans-serif;font-size:14px;color:#555">${data.phone}</td></tr>
    </table>

    <p style="margin:0;font-family:'Segoe UI',Arial,sans-serif;font-size:14px;color:#4b5563;line-height:1.65">Your fragrance is on the way to being packed. We&rsquo;ll send another update once it is handed over to our courier team.</p>`;

  return baseLayout("Order Confirmation - Aroma Notes", body);
}

export function buildShippedEmailHtml(
  data: OrderEmailData & { deliveryDays: number },
): string {
  const body = `
    <div style="text-align:center;margin-bottom:24px">
      <div style="display:inline-block;background:#e8fff8;border-radius:50%;width:64px;height:64px;line-height:64px;text-align:center;font-size:28px;border:1px solid #c8f1e4">&#128666;</div>
    </div>

    <h2 style="margin:0 0 4px;font-family:'Segoe UI',Arial,sans-serif;font-size:22px;color:#0f172a;text-align:center">Your Order Is On The Way!</h2>
    <p style="margin:0 0 24px;font-family:'Segoe UI',Arial,sans-serif;font-size:14px;color:#4b5563;text-align:center;line-height:1.65">Hi ${data.customerName}, great news! We have handed your order to our courier team.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fbff;border:1px solid #e6eefb;border-radius:12px;margin-bottom:24px">
      <tr>
        <td style="padding:8px 16px">
          <p style="margin:0;font-family:'Segoe UI',Arial,sans-serif;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px">Order Number</p>
          <p style="margin:4px 0 0;font-family:'Segoe UI',Arial,sans-serif;font-size:18px;font-weight:700;color:#1a1a2e">${data.orderNumber}</p>
        </td>
        <td style="padding:8px 16px;text-align:right">
          <p style="margin:0;font-family:'Segoe UI',Arial,sans-serif;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px">Payment</p>
          <p style="margin:4px 0 0;font-family:'Segoe UI',Arial,sans-serif;font-size:14px;font-weight:600;color:#1a1a2e">${paymentLabel(data.paymentMethod)}</p>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#0f172a 0%,#1e3a8a 45%,#059669 100%);border-radius:12px;margin-bottom:24px">
      <tr>
        <td style="padding:20px;text-align:center">
          <p style="margin:0;font-family:'Segoe UI',Arial,sans-serif;font-size:12px;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:1px">Estimated Delivery</p>
          <p style="margin:8px 0 0;font-family:'Segoe UI',Arial,sans-serif;font-size:28px;font-weight:700;color:#ffffff">${data.deliveryDays} Working Day${data.deliveryDays > 1 ? "s" : ""}</p>
        </td>
      </tr>
    </table>

    <h3 style="margin:0 0 12px;font-family:'Segoe UI',Arial,sans-serif;font-size:14px;font-weight:700;color:#0f172a;text-transform:uppercase;letter-spacing:1px">Items in This Shipment</h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e7ecf4;border-radius:10px;overflow:hidden;margin-bottom:20px">
      <tr style="background:#f5f8fd">
        <th style="padding:10px 12px;font-family:'Segoe UI',Arial,sans-serif;font-size:12px;color:#666;text-align:left;text-transform:uppercase;letter-spacing:0.5px">Product</th>
        <th style="padding:10px 12px;font-family:'Segoe UI',Arial,sans-serif;font-size:12px;color:#666;text-align:center;text-transform:uppercase;letter-spacing:0.5px">Qty</th>
        <th style="padding:10px 12px;font-family:'Segoe UI',Arial,sans-serif;font-size:12px;color:#666;text-align:right;text-transform:uppercase;letter-spacing:0.5px">Amount</th>
      </tr>
      ${itemsTableHtml(data.items)}
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      <tr>
        <td style="padding:6px 0;font-family:'Segoe UI',Arial,sans-serif;font-size:14px;color:#666">Subtotal</td>
        <td style="padding:6px 0;font-family:'Segoe UI',Arial,sans-serif;font-size:14px;color:#333;text-align:right">${formatLkr(data.subtotal)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-family:'Segoe UI',Arial,sans-serif;font-size:14px;color:#666">Delivery Fee</td>
        <td style="padding:6px 0;font-family:'Segoe UI',Arial,sans-serif;font-size:14px;color:#333;text-align:right">${formatLkr(data.deliveryFee)}</td>
      </tr>
      <tr>
        <td style="padding:10px 0 0;font-family:'Segoe UI',Arial,sans-serif;font-size:16px;font-weight:700;color:#1a1a2e;border-top:2px solid #eee">Total</td>
        <td style="padding:10px 0 0;font-family:'Segoe UI',Arial,sans-serif;font-size:16px;font-weight:700;color:#1a1a2e;text-align:right;border-top:2px solid #eee">${formatLkr(data.total)}</td>
      </tr>
    </table>

    <h3 style="margin:0 0 12px;font-family:'Segoe UI',Arial,sans-serif;font-size:14px;font-weight:700;color:#0f172a;text-transform:uppercase;letter-spacing:1px">Delivering To</h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fbff;border:1px solid #e6eefb;border-radius:10px;padding:12px 16px;margin-bottom:24px">
      <tr><td style="padding:4px 16px;font-family:'Segoe UI',Arial,sans-serif;font-size:14px;color:#333"><strong>${data.customerName}</strong></td></tr>
      <tr><td style="padding:4px 16px;font-family:'Segoe UI',Arial,sans-serif;font-size:14px;color:#555">${data.address}</td></tr>
      <tr><td style="padding:4px 16px;font-family:'Segoe UI',Arial,sans-serif;font-size:14px;color:#555">${data.city}</td></tr>
      <tr><td style="padding:4px 16px;font-family:'Segoe UI',Arial,sans-serif;font-size:14px;color:#555">${data.phone}</td></tr>
    </table>

    <p style="margin:0;font-family:'Segoe UI',Arial,sans-serif;font-size:14px;color:#4b5563;line-height:1.7">
      Delivery ETA: <strong style="color:#111827">${data.deliveryDays} working day${data.deliveryDays > 1 ? "s" : ""}</strong><br/>
      Payment Method: <strong style="color:#111827">${paymentLabel(data.paymentMethod)}</strong><br/>
      Thank you for shopping with Aroma Notes. We can’t wait for you to enjoy your fragrance.
    </p>`;

  return baseLayout("Your Order Has Been Shipped - Aroma Notes", body);
}

export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<void> {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("[Email] GMAIL_USER / GMAIL_APP_PASSWORD not set, skipping email");
    return;
  }
  await transporter.sendMail({
    from: `"Aroma Notes" <${process.env.GMAIL_USER}>`,
    to: data.customerEmail,
    subject: `Order Confirmed - ${data.orderNumber} | Aroma Notes`,
    html: buildOrderConfirmationHtml(data),
  });
}

export async function sendShippedEmail(
  data: OrderEmailData & { deliveryDays: number },
): Promise<void> {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("[Email] GMAIL_USER / GMAIL_APP_PASSWORD not set, skipping email");
    return;
  }
  await transporter.sendMail({
    from: `"Aroma Notes" <${process.env.GMAIL_USER}>`,
    to: data.customerEmail,
    subject: `Your Order ${data.orderNumber} Has Been Shipped! | Aroma Notes`,
    html: buildShippedEmailHtml(data),
  });
}
