"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Brand } from "@/components/brand";
import { Icon } from "@/components/icons";
import { calculateTotal, formatNpr, MAX_QUANTITY, product } from "@/lib/product";

const testimonials = [
  {
    name: "Anisha Shrestha",
    location: "Lalitpur",
    quote:
      "The stretchable fabric feels so easy to wear, and the handwork gives the dress a really elegant finish.",
  },
  {
    name: "Prakriti Karki",
    location: "Kathmandu",
    quote:
      "It is the kind of one-piece I can style for a family gathering and still feel comfortable for hours.",
  },
  {
    name: "Sabina Rai",
    location: "Bhaktapur",
    quote:
      "The rich berry colour and floral embroidery look beautiful together. Simple, graceful, and very wearable.",
  },
];

const faqs = [
  {
    question: "Is the dress stretchable?",
    answer:
      "Yes. The dress is made with stretchable fabric designed to feel comfortable and move easily with you.",
  },
  {
    question: "Is the embroidery handmade?",
    answer:
      "Yes. The floral detail is hand embroidered, giving the neckline a distinctive, crafted finish.",
  },
  {
    question: "How will my size be confirmed?",
    answer:
      "After you place the order, our sales representative will call you to confirm availability, sizing, and fit before dispatch.",
  },
  {
    question: "Is delivery free?",
    answer:
      "Delivery is free inside Kathmandu Valley. For locations outside the Valley, any delivery charge will be confirmed with you before dispatch.",
  },
  {
    question: "How do I pay?",
    answer:
      "This order uses Cash On Delivery. You do not need to make an online payment while placing the order.",
  },
  {
    question: "How should I care for the handwork?",
    answer:
      "We recommend gentle washing and avoiding harsh handling around the embroidery. Please follow the garment care guidance confirmed with your order.",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const total = calculateTotal(quantity);

  function checkout() {
    const params = new URLSearchParams({
      product: product.id,
      quantity: String(quantity),
    });
    router.push(`/checkout?${params.toString()}`);
  }

  function changeQuantity(next: number) {
    setQuantity(Math.min(MAX_QUANTITY, Math.max(1, next)));
  }

  return (
    <main className="overflow-hidden bg-ivory text-ink">
      <div className="bg-berry px-4 py-2.5 text-center text-xs font-bold tracking-wide text-white">
        10% OFF · Free delivery inside Kathmandu Valley · Cash On Delivery
      </div>

      <header className="section-shell flex h-20 items-center justify-between">
        <Brand />
        <div className="hidden sm:block">
          <button onClick={checkout} className="button-secondary">
            <Icon name="bag" /> Order now
          </button>
        </div>
      </header>

      <section className="relative border-y border-black/5 bg-[#f8eee9]">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-blush/70 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
        <div className="section-shell relative grid min-h-[700px] items-center gap-8 py-14 lg:grid-cols-[1.02fr_.98fr] lg:py-20">
          <div className="fade-up relative z-10 max-w-2xl">
            <p className="eyebrow mb-5">New boutique favourite</p>
            <h1 className="font-display text-5xl leading-[1.02] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              Easy elegance,
              <span className="block italic text-berry">beautifully embroidered.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-black/65 sm:text-lg">
              {product.description} Cool, comfortable, and ready to make every occasion feel a little more special.
            </p>

            <div className="mt-8 flex flex-wrap items-end gap-4">
              <div>
                <p className="text-sm text-black/45 line-through">{formatNpr(product.regularPrice)}</p>
                <p className="font-display text-3xl font-bold text-berry">{formatNpr(product.offerPrice)}</p>
              </div>
              <span className="mb-1 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-berry shadow-sm">Save 10%</span>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button onClick={checkout} className="button-primary px-8">
                Purchase now <span aria-hidden="true">→</span>
              </button>
              <a href="#details" className="button-secondary px-8">
                Explore the dress
              </a>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-black/60">
              <span className="inline-flex items-center gap-2"><Icon name="shield" className="h-4 w-4 text-sage" />Cash On Delivery</span>
              <span className="inline-flex items-center gap-2"><Icon name="delivery" className="h-4 w-4 text-sage" />Valley delivery included</span>
              <span className="inline-flex items-center gap-2"><Icon name="phone" className="h-4 w-4 text-sage" />Phone confirmation</span>
            </div>
          </div>

          <div className="fade-up-delay relative mx-auto w-full max-w-[520px]">
            <div className="absolute inset-x-12 bottom-5 h-14 rounded-[50%] bg-black/15 blur-xl" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[180px_180px_40px_40px] border border-white/80 bg-gradient-to-b from-white via-[#f7e8e7] to-[#ead3d5] shadow-soft">
              <Image
                src={product.images[0].src}
                alt={product.images[0].alt}
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 45vw"
                className="object-contain object-bottom p-5"
              />
              <div className="absolute right-6 top-10 rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-berry shadow-card backdrop-blur">Hand embroidered</div>
            </div>
          </div>
        </div>
      </section>

      <section id="details" className="section-shell py-20 sm:py-28">
        <div className="mb-12 max-w-2xl">
          <p className="eyebrow">Look closer</p>
          <h2 className="mt-4 font-display text-4xl tracking-tight sm:text-5xl">Designed for comfort. Finished by hand.</h2>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.08fr_.92fr] lg:gap-16">
          <div>
            <div className="relative aspect-square overflow-hidden rounded-[32px] bg-[#f3e8e4] shadow-card">
              <Image
                src={product.images[activeImage].src}
                alt={product.images[activeImage].alt}
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-contain p-6 transition-all duration-300 sm:p-10"
              />
              <button
                aria-label="Previous product image"
                onClick={() => setActiveImage((activeImage - 1 + product.images.length) % product.images.length)}
                className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-xl shadow-card transition hover:bg-white"
              >
                ‹
              </button>
              <button
                aria-label="Next product image"
                onClick={() => setActiveImage((activeImage + 1) % product.images.length)}
                className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-xl shadow-card transition hover:bg-white"
              >
                ›
              </button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {product.images.map((image, index) => (
                <button
                  key={image.src}
                  onClick={() => setActiveImage(index)}
                  aria-label={`Show product image ${index + 1}`}
                  aria-pressed={activeImage === index}
                  className={`relative aspect-square overflow-hidden rounded-2xl border-2 bg-[#f3e8e4] transition ${
                    activeImage === index ? "border-berry" : "border-transparent hover:border-berry/30"
                  }`}
                >
                  <Image src={image.src} alt="" fill sizes="180px" className="object-contain p-2" />
                </button>
              ))}
            </div>
          </div>

          <div className="self-center rounded-[32px] border border-black/5 bg-white p-6 shadow-card sm:p-9">
            <p className="eyebrow">Limited-time offer</p>
            <h2 className="mt-3 font-display text-4xl tracking-tight">{product.name}</h2>
            <p className="mt-4 leading-7 text-black/60">{product.description}</p>

            <div className="my-7 h-px bg-black/5" />
            <ul className="grid gap-3">
              {product.benefits.map((benefit) => (
                <li key={benefit.title} className="flex items-start gap-3 text-sm leading-6 text-black/70">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blush text-berry"><Icon name="check" className="h-3.5 w-3.5" /></span>
                  <span><strong className="text-ink">{benefit.title}.</strong> {benefit.description}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-2xl bg-ivory p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-black/45">Offer price</p>
                  <p className="mt-1 font-display text-3xl font-bold text-berry">{formatNpr(product.offerPrice)}</p>
                  <p className="mt-1 text-xs text-black/45"><span className="line-through">{formatNpr(product.regularPrice)}</span> · 10% off</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-black/45">Quantity</p>
                  <div className="mt-2 inline-flex items-center rounded-full border border-black/10 bg-white p-1">
                    <button onClick={() => changeQuantity(quantity - 1)} aria-label="Decrease quantity" className="grid h-9 w-9 place-items-center rounded-full text-xl hover:bg-blush/60">−</button>
                    <span className="w-9 text-center text-sm font-bold" aria-live="polite">{quantity}</span>
                    <button onClick={() => changeQuantity(quantity + 1)} aria-label="Increase quantity" className="grid h-9 w-9 place-items-center rounded-full text-xl hover:bg-blush/60">+</button>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-4">
                <span className="text-sm text-black/55">Your total</span>
                <strong className="text-lg text-ink">{formatNpr(total)}</strong>
              </div>
              <p className="mt-3 text-xs leading-5 text-black/50">{product.deliveryNote}</p>
            </div>

            <button onClick={checkout} className="button-primary mt-5 w-full">Buy now · {formatNpr(total)} <span aria-hidden="true">→</span></button>
            <p className="mt-3 text-center text-xs text-black/45">No online payment required</p>
          </div>
        </div>
      </section>

      <section className="bg-berry-dark py-20 text-white sm:py-28">
        <div className="section-shell">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blush">Why you’ll love it</p>
            <h2 className="mt-4 font-display text-4xl tracking-tight sm:text-5xl">One dress, many beautiful moments.</h2>
            <p className="mt-5 leading-7 text-white/65">From an easy afternoon to a family gathering, this one-piece balances artisan detail with the comfort you want to keep wearing.</p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {product.benefits.map((benefit, index) => (
              <article key={benefit.title} className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-blush">
                  <Icon name={(["needle", "heart", "sparkle", "bag"] as const)[index]} />
                </span>
                <h3 className="mt-5 font-display text-xl">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/60">{benefit.description}</p>
              </article>
            ))}
          </div>
          <div className="mt-10 text-center"><button onClick={checkout} className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-bold text-berry-dark transition hover:-translate-y-0.5 hover:bg-blush">Order your dress</button></div>
        </div>
      </section>

      <section className="section-shell py-20 sm:py-28">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <p className="eyebrow">Sample testimonial copy</p>
            <h2 className="mt-4 font-display text-4xl tracking-tight sm:text-5xl">Words that fit the feeling.</h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-black/50">Draft content only—replace these examples with verified customer feedback before publishing.</p>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <figure key={testimonial.name} className="rounded-[28px] border border-black/5 bg-white p-7 shadow-card">
              <div className="flex gap-1 text-gold" aria-label="5 out of 5 stars">★★★★★</div>
              <blockquote className="mt-5 font-display text-xl leading-8 text-ink">“{testimonial.quote}”</blockquote>
              <figcaption className="mt-6 border-t border-black/5 pt-5">
                <p className="text-sm font-bold">{testimonial.name}</p>
                <p className="mt-1 text-xs text-black/45">{testimonial.location} · Sample profile</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="border-y border-black/5 bg-white py-20 sm:py-28">
        <div className="section-shell grid gap-10 lg:grid-cols-[.75fr_1.25fr] lg:gap-20">
          <div>
            <p className="eyebrow">Need to know</p>
            <h2 className="mt-4 font-display text-4xl tracking-tight sm:text-5xl">A few helpful answers.</h2>
            <p className="mt-5 leading-7 text-black/55">Still unsure? Place your order and our representative will call before dispatch to confirm the details.</p>
            <button onClick={checkout} className="button-primary mt-7">Order now</button>
          </div>
          <div className="divide-y divide-black/10">
            {faqs.map((faq, index) => (
              <details key={faq.question} className="group py-5" open={index === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-left font-bold">
                  {faq.question}
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ivory text-lg text-berry transition group-open:rotate-45">+</span>
                </summary>
                <p className="max-w-2xl pr-10 pt-3 text-sm leading-7 text-black/55">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell py-20 sm:py-28">
        <div className="relative overflow-hidden rounded-[36px] bg-[#efd8df] px-6 py-14 text-center sm:px-12 sm:py-20">
          <div className="absolute -left-16 -top-16 h-52 w-52 rounded-full border-[36px] border-white/25" />
          <div className="absolute -bottom-20 -right-16 h-60 w-60 rounded-full border-[44px] border-berry/10" />
          <div className="relative mx-auto max-w-2xl">
            <p className="eyebrow">10% off for a limited time</p>
            <h2 className="mt-4 font-display text-4xl tracking-tight sm:text-6xl">Bring home easy elegance.</h2>
            <p className="mx-auto mt-5 max-w-xl leading-7 text-black/60">Order today for {formatNpr(product.offerPrice)} per piece. Cash On Delivery and free delivery inside Kathmandu Valley.</p>
            <button onClick={checkout} className="button-primary mt-8 px-9">Purchase now <span aria-hidden="true">→</span></button>
          </div>
        </div>
      </section>

      <footer className="border-t border-black/5 bg-white py-10">
        <div className="section-shell flex flex-col gap-5 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <Brand />
          <p className="text-xs text-black/45">© {new Date().getFullYear()} A&amp;A Fashion Boutique</p>
        </div>
      </footer>

      <div className="fixed inset-x-4 bottom-4 z-50 sm:hidden">
        <button onClick={checkout} className="button-primary w-full shadow-[0_16px_40px_rgba(63,34,44,.28)]">Order now · {formatNpr(total)}</button>
      </div>
    </main>
  );
}
