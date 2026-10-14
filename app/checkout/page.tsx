"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { Brand } from "@/components/brand";
import { Icon } from "@/components/icons";
import { calculateTotal, formatNpr, MAX_QUANTITY, product } from "@/lib/product";

type Fields = {
  fullName: string;
  phone: string;
  email: string;
  location: string;
};

type FieldErrors = Partial<Record<keyof Fields, string[]>>;

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quantity = useMemo(() => {
    const parsed = Number(searchParams.get("quantity") || 1);
    if (!Number.isInteger(parsed)) return 1;
    return Math.min(MAX_QUANTITY, Math.max(1, parsed));
  }, [searchParams]);
  const [requestId, setRequestId] = useState("");
  const [fields, setFields] = useState<Fields>({
    fullName: "",
    phone: "",
    email: "",
    location: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const total = calculateTotal(quantity);

  useEffect(() => {
    setRequestId(crypto.randomUUID());
  }, []);

  function updateField(name: keyof Fields, value: string) {
    setFields((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
    setError("");
  }

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError("");
    setFieldErrors({});
    const stableRequestId = requestId || crypto.randomUUID();
    if (!requestId) setRequestId(stableRequestId);

    try {
      const response = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: stableRequestId,
          ...fields,
          productId: product.id,
          quantity,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        setFieldErrors(data.fieldErrors || {});
        throw new Error(data.message || "We could not submit your order. Please try again.");
      }

      const params = new URLSearchParams({
        orderId: data.order.orderId,
        product: data.order.productName,
        quantity: String(data.order.quantity),
        total: String(data.order.totalPrice),
      });
      router.push(`/thank-you?${params.toString()}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We could not submit your order. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-ivory text-ink">
      <header className="border-b border-black/5 bg-white">
        <div className="section-shell flex h-20 items-center justify-between">
          <Brand />
          <Link href="/" className="text-sm font-bold text-berry hover:text-berry-dark">← Continue shopping</Link>
        </div>
      </header>

      <div className="section-shell py-10 sm:py-16">
        <div className="mb-9 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Secure order form</p>
            <h1 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">Complete your order.</h1>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-sage"><Icon name="shield" className="h-4 w-4" /> Your details are sent securely</div>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[1.1fr_.9fr] lg:gap-12">
          <form onSubmit={submitOrder} className="rounded-[30px] border border-black/5 bg-white p-6 shadow-card sm:p-9" noValidate>
            <div className="mb-7">
              <h2 className="font-display text-2xl">Delivery details</h2>
              <p className="mt-2 text-sm leading-6 text-black/50">We’ll use these details to confirm and deliver your order.</p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-bold">
                Full Name <span className="text-berry">*</span>
                <input
                  className="field"
                  type="text"
                  autoComplete="name"
                  value={fields.fullName}
                  onChange={(event) => updateField("fullName", event.target.value)}
                  placeholder="Your full name"
                  aria-invalid={Boolean(fieldErrors.fullName)}
                  required
                />
                {fieldErrors.fullName?.[0] && <span className="mt-2 block text-xs font-normal text-red-700">{fieldErrors.fullName[0]}</span>}
              </label>
              <label className="text-sm font-bold">
                Phone Number <span className="text-berry">*</span>
                <input
                  className="field"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={fields.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  placeholder="98XXXXXXXX"
                  aria-invalid={Boolean(fieldErrors.phone)}
                  required
                />
                {fieldErrors.phone?.[0] && <span className="mt-2 block text-xs font-normal text-red-700">{fieldErrors.phone[0]}</span>}
              </label>
              <label className="text-sm font-bold sm:col-span-2">
                Email Address <span className="text-berry">*</span>
                <input
                  className="field"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={fields.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="you@example.com"
                  aria-invalid={Boolean(fieldErrors.email)}
                  required
                />
                {fieldErrors.email?.[0] && <span className="mt-2 block text-xs font-normal text-red-700">{fieldErrors.email[0]}</span>}
              </label>
              <label className="text-sm font-bold sm:col-span-2">
                Exact Location <span className="text-berry">*</span>
                <textarea
                  className="field min-h-28 resize-y"
                  autoComplete="street-address"
                  value={fields.location}
                  onChange={(event) => updateField("location", event.target.value)}
                  placeholder="Kindly share your exact location"
                  aria-invalid={Boolean(fieldErrors.location)}
                  required
                />
                {fieldErrors.location?.[0] && <span className="mt-2 block text-xs font-normal text-red-700">{fieldErrors.location[0]}</span>}
              </label>
            </div>

            <div className="my-8 h-px bg-black/5" />

            <div>
              <h2 className="font-display text-2xl">Order details</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <ReadOnlyField label="Product Name" value={product.name} />
                <ReadOnlyField label="Quantity" value={String(quantity)} />
                <ReadOnlyField label="Price Per Piece" value={formatNpr(product.offerPrice)} />
                <ReadOnlyField label="Total Price" value={formatNpr(total)} strong />
              </div>
            </div>

            {error && (
              <div role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800">
                {error}
              </div>
            )}

            <button type="submit" className="button-primary mt-7 w-full" disabled={submitting}>
              {submitting ? (
                <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Submitting Order...</>
              ) : (
                <>Order Now · {formatNpr(total)} <span aria-hidden="true">→</span></>
              )}
            </button>
            <p className="mt-4 text-center text-xs leading-5 text-black/45">By placing your order, you agree to receive a confirmation call. No online payment is collected.</p>
          </form>

          <aside className="lg:sticky lg:top-6">
            <div className="overflow-hidden rounded-[30px] border border-black/5 bg-white shadow-card">
              <div className="grid grid-cols-[130px_1fr] items-center gap-5 bg-[#f4e6e4] p-5 sm:grid-cols-[170px_1fr]">
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-white/50">
                  <Image src={product.images[0].src} alt={product.images[0].alt} fill sizes="170px" className="object-contain p-2" priority />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[.18em] text-berry">Your order</p>
                  <h2 className="mt-2 font-display text-xl leading-snug">{product.name}</h2>
                  <p className="mt-2 text-sm text-black/50">Quantity: {quantity}</p>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-black/50">Subtotal</span><span>{formatNpr(total)}</span></div>
                  <div className="flex justify-between"><span className="text-black/50">Delivery in Kathmandu Valley</span><span className="font-bold text-sage">FREE</span></div>
                  <div className="flex justify-between border-t border-black/5 pt-4 text-base"><strong>Total</strong><strong className="text-berry">{formatNpr(total)}</strong></div>
                </div>
                <p className="mt-5 rounded-2xl bg-ivory px-4 py-3 text-xs leading-5 text-black/55">Outside Kathmandu Valley, any delivery fee will be confirmed by phone before dispatch.</p>
                <div className="mt-6 grid gap-3 border-t border-black/5 pt-5 text-xs text-black/55">
                  <span className="flex items-center gap-2"><Icon name="shield" className="h-4 w-4 text-sage" /> Cash On Delivery</span>
                  <span className="flex items-center gap-2"><Icon name="phone" className="h-4 w-4 text-sage" /> Confirmation call before dispatch</span>
                  <span className="flex items-center gap-2"><Icon name="delivery" className="h-4 w-4 text-sage" /> Simple, assisted delivery</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function ReadOnlyField({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-ivory px-4 py-3.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-black/40">{label}</p>
      <p className={`mt-1 text-sm ${strong ? "font-bold text-berry" : "font-semibold text-ink"}`}>{value}</p>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center bg-ivory text-sm text-black/50">Preparing checkout…</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
