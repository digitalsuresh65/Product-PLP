import { NextRequest, NextResponse } from "next/server";
import { sendBusinessOrderEmail, sendCustomerOrderEmail } from "@/lib/email";
import { saveOrder, updateNotificationState } from "@/lib/google-sheets";
import { orderInputSchema, type OrderRecord } from "@/lib/order-schema";
import { calculateTotal, product } from "@/lib/product";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function nepalDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);
  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

function createOrderRecord(
  input: ReturnType<typeof orderInputSchema.parse>,
): OrderRecord {
  const now = new Date();
  const parts = nepalDateParts(now);
  const compactDate = `${parts.year}${parts.month}${parts.day}`;
  const requestCode = input.requestId.replaceAll("-", "").slice(0, 8).toUpperCase();

  return {
    ...input,
    orderId: `AAF-${compactDate}-${requestCode}`,
    dateTime: `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second} NPT`,
    productName: product.name,
    pricePerPiece: product.offerPrice,
    totalPrice: calculateTotal(input.quantity),
    paymentMethod: "Cash On Delivery",
    orderStatus: "New Order",
  };
}

function originAllowed(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const configured = [
    process.env.FRONTEND_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
  ]
    .map((value) => value?.trim().replace(/\/$/, ""))
    .filter(Boolean);

  if (configured.length === 0) return true;
  return configured.includes(origin.replace(/\/$/, ""));
}

export async function POST(request: NextRequest) {
  if (!originAllowed(request)) {
    return NextResponse.json(
      { success: false, message: "This order request is not allowed." },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request body." },
      { status: 400 },
    );
  }

  const parsed = orderInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Please correct the highlighted order details.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const order = createOrderRecord(parsed.data);

  try {
    const stored = await saveOrder(order);

    if (stored.notificationState === "complete") {
      return NextResponse.json({
        success: true,
        order: {
          orderId: order.orderId,
          productName: order.productName,
          quantity: order.quantity,
          totalPrice: order.totalPrice,
          paymentMethod: order.paymentMethod,
        },
      });
    }

    if (stored.notificationState === "pending") {
      await sendBusinessOrderEmail(order);
      await updateNotificationState(stored.rowNumber, "business-sent");
    }

    await sendCustomerOrderEmail(order);
    await updateNotificationState(stored.rowNumber, "complete");

    return NextResponse.json({
      success: true,
      order: {
        orderId: order.orderId,
        productName: order.productName,
        quantity: order.quantity,
        totalPrice: order.totalPrice,
        paymentMethod: order.paymentMethod,
      },
    });
  } catch (error) {
    console.error("Order processing failed:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          "We could not finish processing your order. Your details may already be saved, so please try again once or contact us if the problem continues.",
      },
      { status: 503 },
    );
  }
}
