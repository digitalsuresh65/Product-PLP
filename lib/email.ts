import nodemailer from "nodemailer";
import type { SendMailOptions, SentMessageInfo } from "nodemailer";
import type { OrderRecord } from "@/lib/order-schema";
import { formatNpr } from "@/lib/product";

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required server environment variable: ${name}`);
  }
  return value;
}

function escapeHtml(value: string | number) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function emailShell(content: string, preview: string) {
  return `<!doctype html>
  <html lang="en">
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <title>${escapeHtml(preview)}</title>
    </head>
    <body style="margin:0;background:#f7f2ec;font-family:Arial,Helvetica,sans-serif;color:#261d20;">
      <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preview)}</div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f7f2ec;">
        <tr><td align="center" style="padding:28px 12px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 12px 36px rgba(63,34,44,.08);">
            ${content}
          </table>
          <p style="margin:18px 0 0;color:#7d6f73;font-size:12px;">Sent securely by A&amp;A Fashion Boutique.</p>
        </td></tr>
      </table>
    </body>
  </html>`;
}

function header(brandName: string, eyebrow: string, title: string) {
  return `<tr><td style="padding:32px;background:#7f2446;color:#ffffff;">
    <p style="margin:0 0 18px;font-family:Georgia,serif;font-size:24px;letter-spacing:.4px;">${escapeHtml(brandName)}</p>
    <p style="margin:0 0 7px;font-size:11px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#f6d8e3;">${escapeHtml(eyebrow)}</p>
    <h1 style="margin:0;font-family:Georgia,serif;font-size:30px;line-height:1.2;font-weight:500;">${escapeHtml(title)}</h1>
  </td></tr>`;
}

function detailRow(label: string, value: string | number, strong = false) {
  return `<tr>
    <td style="padding:9px 0;color:#796b6f;font-size:14px;border-bottom:1px solid #eee7e9;">${escapeHtml(label)}</td>
    <td align="right" style="padding:9px 0;color:#261d20;font-size:14px;border-bottom:1px solid #eee7e9;${strong ? "font-weight:700;" : ""}">${escapeHtml(value)}</td>
  </tr>`;
}

function getTransport() {
  const port = Number(required("SMTP_PORT"));
  if (!Number.isInteger(port)) throw new Error("SMTP_PORT must be a number.");

  return nodemailer.createTransport({
    host: required("SMTP_HOST"),
    port,
    secure: port === 465,
    auth: {
      user: required("SMTP_USER"),
      pass: required("SMTP_PASS"),
    },
  });
}

function mailboxAddress(value: string) {
  return value.match(/<([^>]+)>/)?.[1]?.trim() || value.trim();
}

function sender() {
  const brandName = process.env.BRAND_NAME?.trim() || "A&A Fashion Boutique";
  const smtpUser = required("SMTP_USER");
  const configuredFrom = process.env.EMAIL_FROM?.trim() || smtpUser;
  const configuredAddress = mailboxAddress(configuredFrom);
  const emailFrom =
    configuredAddress.toLowerCase() === smtpUser.toLowerCase()
      ? configuredAddress
      : smtpUser;

  return {
    brandName,
    emailFrom,
    formatted: `${brandName} <${emailFrom}>`,
  };
}

function acceptedAddress(value: unknown) {
  if (typeof value === "string") return mailboxAddress(value).toLowerCase();
  if (
    value &&
    typeof value === "object" &&
    "address" in value &&
    typeof value.address === "string"
  ) {
    return value.address.trim().toLowerCase();
  }
  return "";
}

async function sendAcceptedMail(
  options: SendMailOptions,
  recipient: string,
): Promise<SentMessageInfo> {
  const transport = getTransport();
  const result = await transport.sendMail(options);
  const expected = mailboxAddress(recipient).toLowerCase();
  const accepted = Array.isArray(result.accepted)
    ? result.accepted.map(acceptedAddress)
    : [];

  if (!accepted.includes(expected)) {
    throw new Error(`SMTP did not accept the intended recipient (${expected}).`);
  }

  return result;
}

export async function sendBusinessOrderEmail(order: OrderRecord) {
  const { brandName, emailFrom, formatted } = sender();
  const businessEmail = required("BUSINESS_EMAIL");
  const text = [
    `New cash on delivery order: ${order.orderId}`,
    "",
    `Customer: ${order.fullName}`,
    `Phone: ${order.phone}`,
    `Email: ${order.email}`,
    `Location: ${order.location}`,
    "",
    `Product: ${order.productName}`,
    `Quantity: ${order.quantity}`,
    `Price per piece: ${formatNpr(order.pricePerPiece)}`,
    `Total: ${formatNpr(order.totalPrice)}`,
    `Payment: ${order.paymentMethod}`,
    `Date and time: ${order.dateTime}`,
    "",
    "Please call the customer soon to confirm this order.",
  ].join("\n");

  const html = emailShell(
    `${header(brandName, "New cash on delivery order", "A new order has arrived")}
    <tr><td style="padding:28px 32px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr><td style="padding:12px 16px;background:#fbf1f5;border-radius:12px;color:#7f2446;font-weight:700;font-size:14px;">Order ID: ${escapeHtml(order.orderId)}</td></tr>
      </table>
      <h2 style="margin:26px 0 8px;font-size:16px;">Customer details</h2>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        ${detailRow("Name", order.fullName)}
        ${detailRow("Phone", order.phone)}
        ${detailRow("Email", order.email)}
        ${detailRow("Exact location", order.location)}
      </table>
      <h2 style="margin:26px 0 8px;font-size:16px;">Product & payment</h2>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        ${detailRow("Product", order.productName)}
        ${detailRow("Quantity", order.quantity)}
        ${detailRow("Price per piece", formatNpr(order.pricePerPiece))}
        ${detailRow("Total", formatNpr(order.totalPrice), true)}
        ${detailRow("Payment method", order.paymentMethod)}
        ${detailRow("Date & time", order.dateTime)}
      </table>
      <p style="display:inline-block;margin:22px 0 0;padding:7px 11px;background:#e7f1e9;color:#35523d;border-radius:999px;font-size:12px;font-weight:700;">New Order</p>
      <div style="margin-top:20px;padding:16px;border-left:4px solid #b88945;background:#fff8e9;color:#5c4729;font-size:14px;line-height:1.55;">Please call the customer soon to confirm this order.</div>
    </td></tr>`,
    `New order ${order.orderId} from ${order.fullName}`,
  );

  await sendAcceptedMail(
    {
      from: formatted,
      to: businessEmail,
      replyTo: order.email,
      envelope: { from: emailFrom, to: businessEmail },
      subject: `New Product Order Received - ${order.orderId}`,
      text,
      html,
    },
    businessEmail,
  );
}

export async function sendCustomerOrderEmail(order: OrderRecord) {
  const { brandName, emailFrom, formatted } = sender();
  const supportEmail = process.env.BUSINESS_EMAIL?.trim() || emailFrom;
  const firstName = order.fullName.split(" ")[0];
  const text = [
    `Hi ${firstName},`,
    "",
    "We have received your order successfully. Our sales representative will call you soon to confirm it.",
    "",
    `Order ID: ${order.orderId}`,
    `Product: ${order.productName}`,
    `Quantity: ${order.quantity}`,
    `Total price: ${formatNpr(order.totalPrice)}`,
    `Payment method: ${order.paymentMethod}`,
    "",
    "Please keep your phone available. Payment is collected only when your order is delivered.",
    `Need help? Reply to this email or contact ${supportEmail}.`,
    "",
    `Thank you,`,
    brandName,
  ].join("\n");

  const html = emailShell(
    `${header(brandName, "Order received", `Thank you, ${firstName}!`)}
    <tr><td style="padding:28px 32px;">
      <p style="margin:0;color:#4d4145;font-size:15px;line-height:1.7;">We have received your order successfully. Our sales representative will call you soon to confirm your order.</p>
      <p style="margin:20px 0 6px;color:#796b6f;font-size:12px;text-transform:uppercase;letter-spacing:1.2px;">Order ID</p>
      <p style="margin:0 0 22px;color:#7f2446;font-size:18px;font-weight:700;">${escapeHtml(order.orderId)}</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        ${detailRow("Product", order.productName)}
        ${detailRow("Quantity", order.quantity)}
        ${detailRow("Total price", formatNpr(order.totalPrice), true)}
        ${detailRow("Payment method", order.paymentMethod)}
      </table>
      <div style="margin-top:24px;padding:16px;background:#f8f4ef;border-radius:12px;color:#55484c;font-size:14px;line-height:1.6;">Please keep your phone available. Payment is collected only when your order is delivered.</div>
      <p style="margin:24px 0 0;color:#4d4145;font-size:14px;line-height:1.7;">Need help? Reply to this email or contact <a href="mailto:${escapeHtml(supportEmail)}" style="color:#7f2446;">${escapeHtml(supportEmail)}</a>.</p>
      <p style="margin:20px 0 0;color:#4d4145;font-size:14px;line-height:1.6;">Thank you,<br><strong>${escapeHtml(brandName)}</strong></p>
    </td></tr>`,
    `Your ${brandName} order has been received`,
  );

  await sendAcceptedMail(
    {
      from: formatted,
      to: order.email,
      replyTo: supportEmail,
      envelope: { from: emailFrom, to: order.email },
      subject: `Order confirmation ${order.orderId} - ${brandName}`,
      text,
      html,
    },
    order.email,
  );
}
