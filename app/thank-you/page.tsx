"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Brand } from "@/components/brand";
import { Icon } from "@/components/icons";
import { formatNpr, product as catalogProduct } from "@/lib/product";

function ThankYouContent() {
  const params = useSearchParams();
  const orderId = params.get("orderId") || "Pending confirmation";
  const productName = params.get("product") || catalogProduct.name;
  const quantity = Math.max(1, Number(params.get("quantity")) || 1);
  const total = Math.max(catalogProduct.offerPrice, Number(params.get("total")) || catalogProduct.offerPrice);

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-ivory px-5 py-12 text-ink">
      <div className="absolute -left-28 top-20 h-80 w-80 rounded-full bg-blush/75 blur-3xl" />
      <div className="absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />

      <div className="relative w-full max-w-2xl">
        <div className="mb-7 text-center"><Brand /></div>
        <section className="overflow-hidden rounded-[34px] border border-black/5 bg-white shadow-soft">
          <div className="bg-berry px-6 py-10 text-center text-white sm:px-10">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white text-berry shadow-card">
              <Icon name="check" className="h-8 w-8" />
            </span>
            <p className="mt-6 text-[11px] font-bold uppercase tracking-[.2em] text-blush">Order received</p>
            <h1 className="mt-2 font-display text-4xl tracking-tight sm:text-5xl">Thank you for your order!</h1>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-white/75">Our sales representative will call you soon to confirm your order.</p>
          </div>

          <div className="p-6 sm:p-10">
            <div className="rounded-2xl bg-ivory px-5 py-4 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-black/40">Order ID</p>
              <p className="mt-1 font-bold text-berry">{orderId}</p>
            </div>

            <dl className="mt-7 divide-y divide-black/5 text-sm">
              <SummaryRow label="Product ordered" value={productName} />
              <SummaryRow label="Quantity" value={String(quantity)} />
              <SummaryRow label="Total price" value={formatNpr(total)} strong />
              <SummaryRow label="Payment method" value="Cash On Delivery" />
            </dl>

            <div className="mt-7 rounded-2xl border border-sage/15 bg-[#f1f6f2] p-4 text-sm leading-6 text-sage">
              <div className="flex items-start gap-3"><Icon name="phone" className="mt-0.5 h-5 w-5 shrink-0" /><p>Please keep your phone available. We’ll confirm sizing, location, and delivery details before dispatch.</p></div>
            </div>

            <Link href="/" className="button-primary mt-7 w-full">Back to Home</Link>
          </div>
        </section>
        <p className="mt-6 text-center text-xs text-black/40">A confirmation has also been sent to the email address you provided.</p>
      </div>
    </main>
  );
}

function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-5 py-4">
      <dt className="text-black/50">{label}</dt>
      <dd className={`text-right ${strong ? "font-bold text-berry" : "font-semibold"}`}>{value}</dd>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center bg-ivory text-sm text-black/50">Loading your order…</div>}>
      <ThankYouContent />
    </Suspense>
  );
}
